const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/shopnest-mern';

async function checkDatabase() {
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log(`=== FOUND ${users.length} USERS ===`);
    users.forEach(u => {
      console.log(`User: ${u.name} | Email: ${u.email} | Role: ${u.role} | isLoggedIn: ${u.isLoggedIn}`);
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error querying DB:', error);
  }
}

checkDatabase();
