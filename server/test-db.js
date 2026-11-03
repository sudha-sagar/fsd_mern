const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {}

dotenv.config();

const User = require('./models/User');
const TrainingProgram = require('./models/TrainingProgram');
const Registration = require('./models/Registration');

async function testConnection() {
  console.log('--- MongoDB Atlas Connection Verification ---');

  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is missing in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'training_portal_db'
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);

    console.log('\n✅ Registered Mongoose Models:');
    console.log('   1. User Schema        -> collection: users');
    console.log('   2. TrainingProgram    -> collection: trainingprograms');
    console.log('   3. Registration       -> collection: registrations');

    // Wait for indexes to build cleanly
    await Promise.all([
      User.init(),
      TrainingProgram.init(),
      Registration.init()
    ]);
    console.log('✅ Mongoose indexes and schema constraints synchronized cleanly.');

    await mongoose.connection.close();
    console.log('✅ Connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

testConnection();
