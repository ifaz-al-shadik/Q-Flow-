import express from 'express';
import QueueReport from '../models/QueueReport.js';
import Place from '../models/Place.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit a new queue report
router.post('/', protect, async (req, res) => {
    try {
        const { placeId, reportedWaitTime, reportedCrowdStatus } = req.body;

        const reporterId = req.user._id;

        const newReport = new QueueReport({
            placeId,
            reporterId,
            reportedWaitTime,
            reportedCrowdStatus
        });

        const savedReport = await newReport.save();

        // Increment user's report count
        await User.findByIdAndUpdate(req.user._id, { $inc: { reportsCount: 1 } });

        // Trigger async algorithm to verify and update the Place's current actual wait time
        // For this mockup, we'll just directly update the Place document
        await Place.findByIdAndUpdate(placeId, {
            currentWaitTime: reportedWaitTime,
            crowdStatus: reportedCrowdStatus,
            lastUpdated: new Date()
        });

        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET recent reports for a place
router.get('/place/:placeId', async (req, res) => {
    try {
        const reports = await QueueReport.find({ placeId: req.params.placeId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
