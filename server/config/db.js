const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS resolution fallback to ensure Atlas SRV record lookup succeeds across all local networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // If system prevents custom DNS fallback, proceed with default DNS
}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'training_portal_db'
    });
    console.log(`MongoDB Atlas Connected Successfully! Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
