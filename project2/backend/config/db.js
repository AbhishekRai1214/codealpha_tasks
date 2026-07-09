const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
      const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDN connect successfully');
    }catch(error){
        console.error('Mongosdb connection failed',error.message);
        process.exit(1);
    }
};

module.exports = connectDB;