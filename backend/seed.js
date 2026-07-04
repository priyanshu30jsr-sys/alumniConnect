const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
require('dotenv').config();

const seedMockData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear out old data to avoid cluttering your database
    await User.deleteMany({ role: 'Alumni' });
    await Job.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Drop 2 Fake Alumni Accounts into MongoDB
    const alumni1 = await User.create({
      email: '2020ugcs012@nitjsr.ac.in',
      password: passwordHash,
      role: 'Alumni',
      gradYear: 2020,
      branch: 'cs',
      isProfileCompleted: true,
      fullName: 'Rahul Sharma',
      currentCompany: 'Google',
      jobRole: 'Software Engineer II',
      skills: ['React', 'Go', 'Kubernetes'],
      contributionPoints: 150
    });

    const alumni2 = await User.create({
      email: '2018ugme045@nitjsr.ac.in',
      password: passwordHash,
      role: 'Alumni',
      gradYear: 2018,
      branch: 'me',
      isProfileCompleted: true,
      fullName: 'Sneha Kumari',
      currentCompany: 'Atlassian',
      jobRole: 'Product Manager',
      skills: ['Agile', 'Jira', 'Python'],
      contributionPoints: 50
    });
    // Append these inside the try block of your backend/seed.js file, right where other users are created:

const alumni3 = await User.create({
  email: '2019ugme054@nitjsr.ac.in',
  password: passwordHash,
  role: 'Alumni',
  gradYear: 2019,
  branch: 'me',
  isProfileCompleted: true,
  fullName: 'Amit Verma',
  currentCompany: 'Tata Motors',
  jobRole: 'Senior Operations Engineer',
  skills: ['Six Sigma', 'AutoCAD', 'Supply Chain'],
  contributionPoints: 80
});

const alumni4 = await User.create({
  email: '2021ugee023@nitjsr.ac.in',
  password: passwordHash,
  role: 'Alumni',
  gradYear: 2021,
  branch: 'ee',
  isProfileCompleted: true,
  fullName: 'Priya Das',
  currentCompany: 'Microsoft',
  jobRole: 'Cloud Solutions Architect',
  skills: ['Azure', 'C#', 'Terraform'],
  contributionPoints: 120
});

const alumni5 = await User.create({
  email: '2017ugec088@nitjsr.ac.in',
  password: passwordHash,
  role: 'Alumni',
  gradYear: 2017,
  branch: 'ec',
  isProfileCompleted: true,
  fullName: 'Vikram Malhotra',
  currentCompany: 'Qualcomm',
  jobRole: 'Hardware Verification Engineer',
  skills: ['Verilog', 'SystemVerilog', 'C++'],
  contributionPoints: 200
});

const alumni6 = await User.create({
  email: '2022ugce011@nitjsr.ac.in',
  password: passwordHash,
  role: 'Alumni',
  gradYear: 2022,
  branch: 'ce',
  isProfileCompleted: true,
  fullName: 'Rohan Mishra',
  currentCompany: 'L&T Construction',
  jobRole: 'Project Manager',
  skills: ['STAAD Pro', 'Project Planning', 'MS Project'],
  contributionPoints: 40
});

// OPTIONAL: Add a couple more job listings linked to these new alumni
// await Job.create({
//   postedBy: alumni4._id,
//   alumnusName: alumni4.fullName,
//   companyName: 'Microsoft',
//   jobRole: 'Support Engineer Support Intern',
//   description: 'Looking to refer immediate 2027 batch graduates. Basic cloud fundamentals and strong networking concepts required.',
//   applicationUrl: 'https://careers.microsoft.com'
// });

    // 2. Drop a Mock Referral Job Card linked directly to Rahul
    await Job.create({
      postedBy: alumni1._id,
      alumnusName: alumni1.fullName,
      companyName: 'Google',
      jobRole: 'SDE Intern (Winter 2026)',
      description: 'Looking to refer pre-final year students from NIT Jamshedpur. Strong DSA foundations in Java/C++ required.',
      applicationUrl: 'https://careers.google.com'
    });

    console.log('🎉 Mock Data seeded successfully into MongoDB!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedMockData();