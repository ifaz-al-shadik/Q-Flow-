import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from '../models/Place.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const MOCK_PLACES = [
    {
        name: "City Public Library",
        type: "Public Service",
        location: { type: "Point", coordinates: [-74.006, 40.712] },
        currentWaitTime: 5,
        crowdStatus: "Low"
    },
    {
        name: "Downtown Medical Center",
        type: "Healthcare",
        location: { type: "Point", coordinates: [-74.010, 40.715] },
        currentWaitTime: 45,
        crowdStatus: "High"
    },
    {
        name: "DMV Office - Central",
        type: "Government",
        location: { type: "Point", coordinates: [-74.020, 40.720] },
        currentWaitTime: 20,
        crowdStatus: "Medium"
    },
];

const seedData = async () => {
    try {
        await Place.deleteMany();
        await Place.insertMany(MOCK_PLACES);
        console.log('✅ Mock data seeded successfully');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        process.exit(1);
    }
};

seedData();
