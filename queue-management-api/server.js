import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import placesRouter from './routes/places.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import queuesRouter from './routes/queues.js';
import analyticsRouter from './routes/analytics.js';
import notificationsRouter from './routes/notifications.js';
import usersRouter from './routes/users.js';
import ratingsRouter from './routes/ratings.js';
import Place from './models/Place.js';
import User from './models/User.js';

dotenv.config();

// Rich seed data with all SRS fields
const MOCK_PLACES = [
    {
        name: "Dhaka Medical College Hospital",
        type: "Healthcare",
        address: "Bakshibazar, Dhaka 1000",
        description: "One of Bangladesh's largest public hospitals providing emergency, outpatient, and specialist services.",
        phone: "+880-2-55165088",
        operatingHours: { open: "00:00", close: "23:59", days: "All Days" },
        services: ["Emergency", "Outpatient", "Surgery", "Cardiology", "Pediatrics"],
        location: { type: "Point", coordinates: [90.3978, 23.7256] },
        currentWaitTime: 45,
        crowdStatus: "High",
        liveQueueCount: 18,
        totalVisitors: 2840,
        historicalWaitTimes: [
            { hour: 9, dayOfWeek: 0, avgWait: 55, sampleCount: 12 },
            { hour: 10, dayOfWeek: 0, avgWait: 60, sampleCount: 15 },
            { hour: 14, dayOfWeek: 0, avgWait: 40, sampleCount: 8 },
            { hour: 8, dayOfWeek: 1, avgWait: 35, sampleCount: 10 },
            { hour: 15, dayOfWeek: 3, avgWait: 25, sampleCount: 6 },
        ]
    },
    {
        name: "Square Hospital – Panthapath",
        type: "Healthcare",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka 1205",
        description: "Leading private hospital with modern facilities and specialist care.",
        phone: "+880-2-8159457",
        operatingHours: { open: "08:00", close: "20:00", days: "All Days" },
        services: ["OPD", "Lab Tests", "Cardiology", "Orthopedics", "Neurology"],
        location: { type: "Point", coordinates: [90.3854, 23.7515] },
        currentWaitTime: 30,
        crowdStatus: "Medium",
        liveQueueCount: 9,
        totalVisitors: 1920,
        historicalWaitTimes: [
            { hour: 10, dayOfWeek: 0, avgWait: 40, sampleCount: 8 },
            { hour: 14, dayOfWeek: 2, avgWait: 20, sampleCount: 5 },
            { hour: 17, dayOfWeek: 4, avgWait: 35, sampleCount: 7 },
        ]
    },
    {
        name: "Uttara Passport Office",
        type: "Government",
        address: "House 54, Road 4, Sector 7, Uttara, Dhaka 1230",
        description: "Regional passport issuance and renewal office serving North Dhaka.",
        phone: "+880-2-8931011",
        operatingHours: { open: "09:00", close: "17:00", days: "Sun–Thu" },
        services: ["New Passport", "Renewal", "Emergency Passport", "Correction"],
        location: { type: "Point", coordinates: [90.3990, 23.8759] },
        currentWaitTime: 20,
        crowdStatus: "Medium",
        liveQueueCount: 7,
        totalVisitors: 3200,
        historicalWaitTimes: [
            { hour: 9, dayOfWeek: 0, avgWait: 40, sampleCount: 20 },
            { hour: 11, dayOfWeek: 1, avgWait: 30, sampleCount: 15 },
            { hour: 14, dayOfWeek: 3, avgWait: 15, sampleCount: 10 },
        ]
    },
    {
        name: "Sonali Bank – Motijheel Branch",
        type: "Financial",
        address: "Dilkusha C/A, Motijheel, Dhaka 1000",
        description: "Bangladesh's largest state-owned bank branch handling all government transactions.",
        phone: "+880-2-9553622",
        operatingHours: { open: "10:00", close: "16:00", days: "Sun–Thu" },
        services: ["Cash Deposit", "Withdrawal", "Pension", "Foreign Exchange", "Loans"],
        location: { type: "Point", coordinates: [90.4194, 23.7281] },
        currentWaitTime: 25,
        crowdStatus: "Medium",
        liveQueueCount: 8,
        totalVisitors: 4100,
        historicalWaitTimes: [
            { hour: 10, dayOfWeek: 0, avgWait: 35, sampleCount: 25 },
            { hour: 11, dayOfWeek: 1, avgWait: 40, sampleCount: 18 },
            { hour: 15, dayOfWeek: 4, avgWait: 15, sampleCount: 12 },
        ]
    },
    {
        name: "University of Dhaka Registrar",
        type: "Education",
        address: "University of Dhaka, Shahbagh, Dhaka 1000",
        description: "Main registrar office handling student certificates, transcripts, and enrollment.",
        phone: "+880-2-9661900",
        operatingHours: { open: "09:00", close: "16:00", days: "Sun–Thu" },
        services: ["Certificate Collection", "Transcript", "Enrollment", "Exam Forms"],
        location: { type: "Point", coordinates: [90.3937, 23.7339] },
        currentWaitTime: 15,
        crowdStatus: "Low",
        liveQueueCount: 4,
        totalVisitors: 980,
        historicalWaitTimes: [
            { hour: 10, dayOfWeek: 0, avgWait: 20, sampleCount: 8 },
            { hour: 14, dayOfWeek: 2, avgWait: 10, sampleCount: 5 },
        ]
    },
    {
        name: "Dhaka Public Library",
        type: "Public Service",
        address: "Shahbagh, Dhaka 1000",
        description: "Central public library with reference sections, reading rooms, and digital resources.",
        phone: "+880-2-9661740",
        operatingHours: { open: "08:00", close: "17:00", days: "Sat–Thu" },
        services: ["Book Borrowing", "Reading Room", "Digital Resources", "Research Assistance"],
        location: { type: "Point", coordinates: [90.4074, 23.7104] },
        currentWaitTime: 5,
        crowdStatus: "Low",
        liveQueueCount: 2,
        totalVisitors: 560,
        historicalWaitTimes: [
            { hour: 10, dayOfWeek: 0, avgWait: 8, sampleCount: 5 },
            { hour: 14, dayOfWeek: 3, avgWait: 5, sampleCount: 4 },
        ]
    },
    {
        name: "Bangladesh Post Office – Gulshan",
        type: "Public Service",
        address: "Gulshan-1, Dhaka 1212",
        description: "Full-service post office offering mailing, parcel, and financial services.",
        phone: "+880-2-9881111",
        operatingHours: { open: "09:00", close: "17:00", days: "Sun–Thu" },
        services: ["Parcel", "Money Order", "Registered Mail", "EMS", "Postal Banking"],
        location: { type: "Point", coordinates: [90.4152, 23.7937] },
        currentWaitTime: 40,
        crowdStatus: "High",
        liveQueueCount: 14,
        totalVisitors: 1750,
        historicalWaitTimes: [
            { hour: 10, dayOfWeek: 0, avgWait: 50, sampleCount: 10 },
            { hour: 11, dayOfWeek: 1, avgWait: 45, sampleCount: 8 },
            { hour: 15, dayOfWeek: 3, avgWait: 25, sampleCount: 6 },
        ]
    },
    {
        name: "Bashundhara City Mall – Service Center",
        type: "Retail",
        address: "Panthapath, Dhaka 1205",
        description: "Customer service center for largest shopping complex in Bangladesh.",
        phone: "+880-2-9138888",
        operatingHours: { open: "10:00", close: "20:00", days: "All Days" },
        services: ["Complaints", "Gift Cards", "Lost & Found", "Parking Assistance"],
        location: { type: "Point", coordinates: [90.3943, 23.7508] },
        currentWaitTime: 8,
        crowdStatus: "Low",
        liveQueueCount: 3,
        totalVisitors: 2200,
        historicalWaitTimes: [
            { hour: 14, dayOfWeek: 5, avgWait: 15, sampleCount: 7 },
            { hour: 18, dayOfWeek: 6, avgWait: 20, sampleCount: 9 },
        ]
    },
    {
        name: "BRAC Bank – Gulshan Branch",
        type: "Financial",
        address: "Gulshan Avenue, Dhaka 1212",
        description: "Modern private bank with fast digital services and SME financing.",
        phone: "+880-2-8828000",
        operatingHours: { open: "10:00", close: "16:00", days: "Sun–Thu" },
        services: ["Account Opening", "Loans", "Foreign Exchange", "Card Services"],
        location: { type: "Point", coordinates: [90.4158, 23.7926] },
        currentWaitTime: 12,
        crowdStatus: "Low",
        liveQueueCount: 3,
        totalVisitors: 870,
        historicalWaitTimes: [
            { hour: 11, dayOfWeek: 0, avgWait: 20, sampleCount: 6 },
            { hour: 14, dayOfWeek: 2, avgWait: 10, sampleCount: 4 },
        ]
    },
    {
        name: "National ID Card Office – Agargaon",
        type: "Government",
        address: "E/8, Agargaon, Sher-e-Bangla Nagar, Dhaka 1207",
        description: "Electoral Commission office for NID card issuance, correction, and Smart NID collection.",
        phone: "+880-2-9138120",
        operatingHours: { open: "09:00", close: "17:00", days: "Sun–Thu" },
        services: ["NID Collection", "Correction", "Smart NID", "Voter Registration"],
        location: { type: "Point", coordinates: [90.3763, 23.7775] },
        currentWaitTime: 55,
        crowdStatus: "High",
        liveQueueCount: 22,
        totalVisitors: 5100,
        historicalWaitTimes: [
            { hour: 9, dayOfWeek: 0, avgWait: 70, sampleCount: 30 },
            { hour: 10, dayOfWeek: 1, avgWait: 65, sampleCount: 25 },
            { hour: 14, dayOfWeek: 3, avgWait: 35, sampleCount: 15 },
        ]
    }
];

const startServer = async () => {
    await connectDB();

    // Seed admin user
    try {
        const adminExists = await User.findOne({ email: 'admin@qflow.bd' });
        if (!adminExists) {
            await User.create({
                name: 'Q-Flow Admin',
                email: 'admin@qflow.bd',
                password: 'admin123',
                avatar: 'QA',
                role: 'admin'
            });
            console.log('✅ Admin user seeded: admin@qflow.bd / admin123');
        }
    } catch (e) { console.error('Error seeding admin:', e.message); }

    // Seed places
    try {
        const count = await Place.countDocuments();
        if (count === 0) {
            await Place.insertMany(MOCK_PLACES);
            console.log(`✅ ${MOCK_PLACES.length} places seeded successfully`);
        }
    } catch (e) { console.error('Error seeding places:', e.message); }

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/api/places', placesRouter);
    app.use('/api/reports', reportsRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/queues', queuesRouter);
    app.use('/api/analytics', analyticsRouter);
    app.use('/api/notifications', notificationsRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/ratings', ratingsRouter);

    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'success', message: 'Q-Flow API is up and running' });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Q-Flow API running on port ${PORT}`);
    });
};

startServer();
