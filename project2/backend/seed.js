const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./model/User');
const Product = require('./model/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shopnest.com',
      password: hashedPassword,
      role: 'admin'
    });

    const products = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound experience with advanced active noise cancellation.',
        price: 299.99,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 24
      },
      {
        name: 'Minimalist Modern Chair',
        description: 'A stylish and comfortable addition to any contemporary living room.',
        price: 150.00,
        category: 'Furniture',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.2,
        numReviews: 12
      },
      {
        name: 'Professional DSLR Camera',
        description: 'Capture stunning moments with high-resolution clarity and speed.',
        price: 1199.99,
        category: 'Electronics',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 50
      },
      {
        name: 'Classic White Sneakers',
        description: 'Versatile and comfortable, a staple for any casual outfit.',
        price: 85.00,
        category: 'Clothing',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 89
      },
      {
        name: 'Retro Mechanical Keyboard',
        description: 'Tactile mechanical switches with customizable RGB backlighting.',
        price: 129.99,
        category: 'Electronics',
        stock: 22,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 35
      },
      {
        name: 'Classic Leather Smart Watch',
        description: 'Elegant smartwatch tracking heart rate, steps, and notifications.',
        price: 199.99,
        category: 'Electronics',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.4,
        numReviews: 18
      },
      {
        name: 'Ergonomic Standing Office Desk',
        description: 'Motorized height adjustable standing desk with oak finish.',
        price: 499.00,
        category: 'Furniture',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 29
      },
      {
        name: 'Leather Travel Duffel Bag',
        description: 'Handcrafted full-grain leather duffel bag for weekend getaways.',
        price: 180.00,
        category: 'Clothing',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 14
      },
      {
        name: 'Vintage Denim Jacket',
        description: 'Classic fit unisex denim jacket made from premium durable cotton.',
        price: 95.00,
        category: 'Clothing',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.3,
        numReviews: 42
      },
      {
        name: 'Stainless Steel Insulated Bottle',
        description: 'Double-walled vacuum insulated water bottle keeping drinks cold for 24h.',
        price: 29.99,
        category: 'Accessories',
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 110
      },
      {
        name: 'Smart Wi-Fi Thermostat',
        description: 'Intelligent thermostat with remote programming and energy tracking.',
        price: 220.00,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 33
      },
      {
        name: 'Modern Wooden Dining Table',
        description: 'Beautiful solid oak dining table suitable for family dinners.',
        price: 750.00,
        category: 'Furniture',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 14
      },
      {
        name: 'Premium Leather Notebook',
        description: 'Refillable notebook with top-grain leather cover and archival paper.',
        price: 35.00,
        category: 'Accessories',
        stock: 80,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 45
      },
      {
        name: 'Sleek LED Desk Lamp',
        description: 'Energy-efficient desk lamp with touch controls and adjustable neck.',
        price: 49.99,
        category: 'Electronics',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 54
      },
      {
        name: 'Waterproof Travel Backpack',
        description: 'Durable and spacious backpack with dedicated laptop compartment.',
        price: 110.00,
        category: 'Clothing',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 27
      },
      {
        name: 'Organic Cotton Pullover Hoodie',
        description: 'Super-soft fleece hoodie made from 100% organic cotton.',
        price: 70.00,
        category: 'Clothing',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 68
      },
      {
        name: 'Bamboo Multi-Device Charger',
        description: 'Eco-friendly bamboo charging station organizes and charges up to 5 devices.',
        price: 45.00,
        category: 'Accessories',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1622445262465-2481c8573733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.4,
        numReviews: 22
      },
      {
        name: 'Precision Espresso Coffee Maker',
        description: 'Create barista-quality coffee drinks at home with 15 bar pressure.',
        price: 349.99,
        category: 'Electronics',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 83
      },
      {
        name: 'Premium Non-Slip Yoga Mat',
        description: 'Eco-friendly natural rubber yoga mat offering unmatched grip and cushion.',
        price: 60.00,
        category: 'Accessories',
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 57
      },
      {
        name: 'Portable HD Smart Projector',
        description: 'Mini projector with built-in speakers and smart OS streaming.',
        price: 299.00,
        category: 'Electronics',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 19
      }
    ];

    await Product.insertMany(products);
    
    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();