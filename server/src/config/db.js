const mongoose = require('mongoose');
const dns = require('dns');

// DNS server resolution fallback for Atlas SRV record lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'training_portal_db'
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
