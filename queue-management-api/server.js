import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import placesRouter from './routes/places.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import queuesRouter from './routes/queues.js';
import Place from './models/Place.js';

dotenv.config();

// MOCK DATA for local seed
const MOCK_PLACES = [
    { name: "Dhaka Public Library", type: "Public Service", location: { type: "Point", coordinates: [90.4074, 23.7104] }, currentWaitTime: 5, crowdStatus: "Low" },
    { name: "Dhaka Medical College Hospital", type: "Healthcare", location: { type: "Point", coordinates: [90.3978, 23.7256] }, currentWaitTime: 45, crowdStatus: "High" },
    { name: "Uttara Passport Office", type: "Government", location: { type: "Point", coordinates: [90.3990, 23.8759] }, currentWaitTime: 20, crowdStatus: "Medium" },
    { name: "Square Hospital - Panthapath", type: "Healthcare", location: { type: "Point", coordinates: [90.3854, 23.7515] }, currentWaitTime: 35, crowdStatus: "High" },
    { name: "University of Dhaka Registrar", type: "Education", location: { type: "Point", coordinates: [90.3937, 23.7339] }, currentWaitTime: 15, crowdStatus: "Low" },
    { name: "Sonali Bank - Motijheel", type: "Financial", location: { type: "Point", coordinates: [90.4194, 23.7281] }, currentWaitTime: 25, crowdStatus: "Medium" },
    { name: "Bangladesh Post Office - Gulshan", type: "Public Service", location: { type: "Point", coordinates: [90.4152, 23.7937] }, currentWaitTime: 40, crowdStatus: "High" },
    { name: "Bashundhara City Mall", type: "Retail", location: { type: "Point", coordinates: [90.3943, 23.7508] }, currentWaitTime: 8, crowdStatus: "Low" }
];

const startServer = async () => {
    // Connect to MongoDB
    await connectDB();

    // Seed DB automatically
    try {
        if ((await Place.countDocuments()) === 0) {
            await Place.insertMany(MOCK_PLACES);
            console.log('✅ Mock data seeded successfully');
        }
    } catch (e) { console.error('Error seeding DB on startup', e) }

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Main Routes
    app.use('/api/places', placesRouter);
    app.use('/api/reports', reportsRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/queues', queuesRouter);

    // Base route test
    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'success', message: 'Q-Flow API is up and running' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
};

startServer();
