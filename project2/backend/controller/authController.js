const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');


const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '30d'});
};



const registerUser = async(req,res)=>{
    const  {name, email, password, role} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exits"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const user = await User.create({
            name, 
            email,
            password: hashedPassword,
            role: role === 'admin' ? 'admin' : 'user',
            isLoggedIn: true,
            lastLogin: new Date()
        });
        if(user){
            const otp = Math.floor(10000 + Math.random() * 90000).toString();
            const message = `Welcome to shopnest ${name} Thank you for registering with us. We are exicted to have a part of your community. Your OtP for Shopnest registation is ${otp}`;
            await sendEmail({ email, subject: 'Welcome to shopnest your otp for registation is ', message });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email:  user.email,
                role: user.role,
                token: generateToken(user._id)

            });

        }else{
            res.status(400).json({message: 'Invalid usser data'});
        }
         
    }catch(error){
       res.status(500).json({message: 'Server error'});
    }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      user.isLoggedIn = true;
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isLoggedIn = false;
      await user.save();
      res.json({ message: 'Logged out successfully from database session' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {registerUser, loginUser, getUsers, logoutUser};

