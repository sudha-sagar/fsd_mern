const User = require('./models/User');
const TrainingProgram = require('./models/TrainingProgram');

const seedDemoData = async () => {
  try {
    // 1. Ensure Demo Admin Exists
    let admin = await User.findOne({ email: 'admin@college.edu' });
    if (!admin) {
      admin = await User.create({
        name: 'College Admin',
        email: 'admin@college.edu',
        password: 'password123',
        role: 'admin'
      });
      console.log('✅ Demo Admin created: admin@college.edu / password123');
    } else {
      // Reset password to password123 to ensure demo logins always work
      admin.password = 'password123';
      await admin.save();
      console.log('✅ Demo Admin password updated: admin@college.edu / password123');
    }

    // 2. Ensure Demo Student Exists
    let student = await User.findOne({ email: 'student1@college.edu' });
    if (!student) {
      student = await User.create({
        name: 'Alex Johnson',
        email: 'student1@college.edu',
        password: 'password123',
        role: 'student'
      });
      console.log('✅ Demo Student created: student1@college.edu / password123');
    } else {
      student.password = 'password123';
      await student.save();
      console.log('✅ Demo Student password updated: student1@college.edu / password123');
    }

    // 3. Ensure Sample Training Programs Exist
    const count = await TrainingProgram.countDocuments();
    if (count === 0) {
      await TrainingProgram.create([
        {
          trainingTitle: 'Full Stack Web Development (MERN)',
          trainerName: 'Dr. Robert Smith',
          trainingCategory: 'Software Engineering',
          startDate: new Date(Date.now() + 86400000), // tomorrow
          endDate: new Date(Date.now() + 86400000 * 30),
          duration: '4 Weeks',
          availableSeats: 25
        },
        {
          trainingTitle: 'Data Science & Machine Learning',
          trainerName: 'Prof. Elena Rostova',
          trainingCategory: 'Artificial Intelligence',
          startDate: new Date(Date.now() + 86400000 * 5),
          endDate: new Date(Date.now() + 86400000 * 40),
          duration: '6 Weeks',
          availableSeats: 15
        },
        {
          trainingTitle: 'Cloud Computing & DevOps Fundamentals',
          trainerName: 'Eng. Marcus Vance',
          trainingCategory: 'Infrastructure',
          startDate: new Date(Date.now() + 86400000 * 10),
          endDate: new Date(Date.now() + 86400000 * 25),
          duration: '3 Weeks',
          availableSeats: 20
        }
      ]);
      console.log('✅ Initial demo training programs created');
    }
  } catch (err) {
    console.error('Error seeding demo data:', err.message);
  }
};

module.exports = seedDemoData;
