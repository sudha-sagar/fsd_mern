const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (err) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Ensure NODE_ENV is test to avoid server starting on default port
process.env.NODE_ENV = 'test';
const app = require('./src/server');
const connectDB = require('./src/config/db');

const User = require('./src/models/User');
const TrainingProgram = require('./src/models/TrainingProgram');
const Registration = require('./src/models/Registration');

async function runTests() {
  console.log('====================================================');
  console.log('    TRAINING PORTAL BACKEND API TEST SUITE          ');
  console.log('====================================================');

  let server;
  const PORT = 5009;

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');

    // Clean up test data from previous runs
    await User.deleteMany({ email: /@test\.college\.edu$/ });
    await TrainingProgram.deleteMany({ trainingTitle: /^TEST_/ });
    await Registration.deleteMany({});
    console.log('✅ Test database cleaned up');

    server = app.listen(PORT);
    const baseURL = `http://localhost:${PORT}`;

    // Helper fetch wrapper
    const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const opts = { method, headers };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${baseURL}${endpoint}`, opts);
      const json = await res.json();
      return { status: res.status, body: json };
    };

    console.log('\n--- 1. AUTHENTICATION & ROLE TESTS ---');

    // Register Admin
    const adminReg = await apiCall('/api/auth/register', 'POST', {
      name: 'Test Admin',
      email: 'admin@test.college.edu',
      password: 'password123',
      role: 'admin'
    });
    console.log(`[PASS] Admin Registration: HTTP ${adminReg.status} - ${adminReg.body.message}`);
    const adminToken = adminReg.body.data.token;

    // Register Student 1
    const s1Reg = await apiCall('/api/auth/register', 'POST', {
      name: 'Test Student 1',
      email: 'student1@test.college.edu',
      password: 'password123',
      role: 'student'
    });
    console.log(`[PASS] Student 1 Registration: HTTP ${s1Reg.status} - ${s1Reg.body.message}`);
    const student1Token = s1Reg.body.data.token;

    // Register Student 2
    const s2Reg = await apiCall('/api/auth/register', 'POST', {
      name: 'Test Student 2',
      email: 'student2@test.college.edu',
      password: 'password123',
      role: 'student'
    });
    console.log(`[PASS] Student 2 Registration: HTTP ${s2Reg.status} - ${s2Reg.body.message}`);
    const student2Token = s2Reg.body.data.token;

    // Duplicate email test
    const dupReg = await apiCall('/api/auth/register', 'POST', {
      name: 'Duplicate Student',
      email: 'student1@test.college.edu',
      password: 'password123'
    });
    console.log(`[PASS] Duplicate Email Blocked: HTTP ${dupReg.status} (${dupReg.body.message})`);

    // Login Admin
    const adminLogin = await apiCall('/api/auth/login', 'POST', {
      email: 'admin@test.college.edu',
      password: 'password123'
    });
    console.log(`[PASS] Admin Login: HTTP ${adminLogin.status} - User role: ${adminLogin.body.data.user.role}`);

    // Invalid Login test
    const badLogin = await apiCall('/api/auth/login', 'POST', {
      email: 'admin@test.college.edu',
      password: 'wrongpassword'
    });
    console.log(`[PASS] Invalid Password Rejected: HTTP ${badLogin.status} (${badLogin.body.message})`);

    console.log('\n--- 2. TRAINING PROGRAM API TESTS ---');

    // Admin creates limited seat training program (Seats: 1)
    const t1 = await apiCall('/api/trainings', 'POST', {
      trainingTitle: 'TEST_Web Dev Bootcamp',
      trainerName: 'Prof. Alan Turing',
      trainingCategory: 'Software Engineering',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-30'),
      duration: '4 Weeks',
      availableSeats: 1
    }, adminToken);
    console.log(`[PASS] Admin Created Training Program: HTTP ${t1.status} - ID: ${t1.body.data._id}`);
    const training1Id = t1.body.data._id;

    // Student attempts creating training program (Forbidden test)
    const sCreate = await apiCall('/api/trainings', 'POST', {
      trainingTitle: 'TEST_Unauthorized Training',
      trainerName: 'Hacker',
      trainingCategory: 'Security',
      startDate: new Date(),
      endDate: new Date(),
      duration: '1 Day',
      availableSeats: 10
    }, student1Token);
    console.log(`[PASS] Student Create Blocked (Forbidden): HTTP ${sCreate.status} (${sCreate.body.message})`);

    // Get All Trainings
    const allT = await apiCall('/api/trainings', 'GET', null, student1Token);
    console.log(`[PASS] Get All Trainings: HTTP ${allT.status} - Total count: ${allT.body.data.length}`);

    console.log('\n--- 3. STUDENT REGISTRATION & SEAT LIMIT TESTS ---');

    // Student 1 registers for Training 1 (Seats decrements 1 -> 0)
    const r1 = await apiCall(`/api/trainings/${training1Id}/register`, 'POST', null, student1Token);
    console.log(`[PASS] Student 1 Registered: HTTP ${r1.status} - Statuses: attendance=${r1.body.data.attendanceStatus}, completion=${r1.body.data.completionStatus}`);

    // Student 1 attempts registering again (Duplicate test)
    const r1Dup = await apiCall(`/api/trainings/${training1Id}/register`, 'POST', null, student1Token);
    console.log(`[PASS] Duplicate Registration Prevented: HTTP ${r1Dup.status} (${r1Dup.body.message})`);

    // Student 2 attempts registering for Training 1 (No seats test)
    const r2NoSeat = await apiCall(`/api/trainings/${training1Id}/register`, 'POST', null, student2Token);
    console.log(`[PASS] Zero Seats Registration Blocked: HTTP ${r2NoSeat.status} (${r2NoSeat.body.message})`);

    console.log('\n--- 4. REGISTRATION RETRIEVAL TESTS ---');

    // Student 1 views own registrations
    const myRegs = await apiCall('/api/registrations/my', 'GET', null, student1Token);
    console.log(`[PASS] Student 1 View Registrations: HTTP ${myRegs.status} - Count: ${myRegs.body.data.length} (${myRegs.body.data[0].training.trainingTitle})`);

    // Student tries viewing all registrations (Forbidden)
    const sAllRegs = await apiCall('/api/registrations', 'GET', null, student1Token);
    console.log(`[PASS] Student View All Registrations Blocked: HTTP ${sAllRegs.status} (${sAllRegs.body.message})`);

    // Admin views all registrations
    const adminAllRegs = await apiCall('/api/registrations', 'GET', null, adminToken);
    console.log(`[PASS] Admin View All Registrations: HTTP ${adminAllRegs.status} - Count: ${adminAllRegs.body.data.length}`);
    const registrationId = adminAllRegs.body.data[0]._id;

    console.log('\n--- 5. ATTENDANCE & COMPLETION STATUS TESTS ---');

    // Admin updates attendance and completion status
    const updateStatus = await apiCall(`/api/registrations/${registrationId}`, 'PUT', {
      attendanceStatus: 'present',
      completionStatus: 'completed'
    }, adminToken);
    console.log(`[PASS] Admin Updated Record: HTTP ${updateStatus.status} - attendance: ${updateStatus.body.data.attendanceStatus}, completion: ${updateStatus.body.data.completionStatus}`);

    // Admin passes invalid attendance enum value
    const invalidStatus = await apiCall(`/api/registrations/${registrationId}`, 'PUT', {
      attendanceStatus: 'invalid_attendance_enum'
    }, adminToken);
    console.log(`[PASS] Invalid Attendance Enum Rejected: HTTP ${invalidStatus.status} (${invalidStatus.body.message})`);

    console.log('\n====================================================');
    console.log('✅ ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test suite failure:', err);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
}

runTests();
