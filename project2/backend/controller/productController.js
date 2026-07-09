const Product = require('../model/Product');
const cloudinary = require('../config/cloudinary');


const getProducts = async(req,res)=>{
    try{
        const products = await Product.find({});
        res.json(products);

    }catch(error){
        res.status(500).json({ message: 'Server error' });
    }
};


const getProductById = async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            res.json(product);
        }else{
            res.status(404).json({message: 'Product not found'});
        }
    }catch(error){
        res.status(500).json({message: 'Server error'});
    }
};


const createProduct = async (req, res) => {
  try{
    const { name, description, price, category, stock } = req.body;
    let imageUrl = '';
    if (req.file){
      try {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      } catch (cloudinaryErr) {
        console.error('Cloudinary upload failed, using local fallback:', cloudinaryErr.message);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
    }
    const product = new Product({

      name, 
      description, 
      price, 
      category, 
      stock, 
      imageUrl,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  }catch (error){
    res.status(500).json({ message: error.message });
  }
};


const updateProduct = async(req, res) =>{
  try{
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.stock = stock || product.stock;

      if (req.file){
        try {
          const result = await cloudinary.uploader.upload(req.file.path);
          product.imageUrl = result.secure_url;
        } catch (cloudinaryErr) {
          console.error('Cloudinary update failed, using local fallback:', cloudinaryErr.message);
          product.imageUrl = `/uploads/${req.file.filename}`;
        }
      }
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    }else{
      res.status(404).json({ message: 'Product not found' });
    }
  }catch(error){
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
}