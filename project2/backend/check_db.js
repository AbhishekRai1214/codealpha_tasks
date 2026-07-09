const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/shopnest-mern';

async function checkDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('=== USERS IN DATABASE ===');
    console.log(JSON.stringify(users, null, 2));

   
    const products = await db.collection('products').find({}).toArray();
    console.log('=== PRODUCTS IN DATABASE ===');
    console.log(JSON.stringify(products, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error querying DB:', error);
  }
}

checkDatabase();
