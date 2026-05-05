import express from 'express';
import QueueReport from '../models/QueueReport.js';
import Place from '../models/Place.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// FR-16 & FR-17: Submit a report (wait time, closed, overcrowded, data correction)
router.post('/', protect, async (req, res) => {
    try {
        const { placeId, reportedWaitTime, reportedCrowdStatus, reportType = 'wait_time', note = '' } = req.body;

        if (!placeId || reportedCrowdStatus === undefined) {
            return res.status(400).json({ message: 'placeId and reportedCrowdStatus are required' });
        }

        const newReport = new QueueReport({
            placeId,
            reporterId: req.user._id,
            reporterName: req.user.name,
            reportedWaitTime: reportedWaitTime || 0,
            reportedCrowdStatus,
            reportType,
            note
        });

        const savedReport = await newReport.save();

        // Increment user's report count
        await User.findByIdAndUpdate(req.user._id, { $inc: { reportsCount: 1 } });

        // Update the Place's live data
        const updateData = {
            crowdStatus: reportedCrowdStatus,
            lastUpdated: new Date(),
            $inc: { totalReports: 1 }
        };

        if (reportType === 'closed') {
            updateData.crowdStatus = 'Closed';
            updateData.currentWaitTime = 0;
        } else if (reportedWaitTime) {
            // Weighted average with existing wait time
            const place = await Place.findById(placeId);
            if (place) {
                updateData.currentWaitTime = Math.round(
                    place.currentWaitTime * 0.6 + reportedWaitTime * 0.4
                );
            }
        }

        await Place.findByIdAndUpdate(placeId, updateData);

        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// FR-20: GET current user's report history from DB
router.get('/my', protect, async (req, res) => {
    try {
        const reports = await QueueReport.find({ reporterId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('placeId', 'name type');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// FR-16: Verify or dispute a report
router.patch('/:id/verify', protect, async (req, res) => {
    try {
        const { action } = req.body; // 'verify' or 'dispute'
        const report = await QueueReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        if (action === 'verify') {
            report.verifications += 1;
            // Auto-approve after 3 verifications
            if (report.verifications >= 3) report.status = 'Verified';
        } else if (action === 'dispute') {
            report.disputes += 1;
            if (report.disputes >= 3) report.status = 'Rejected';
        }

        await report.save();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET recent reports for a place (FR-2: shown on place profile)
router.get('/place/:placeId', async (req, res) => {
    try {
        const reports = await QueueReport.find({
            placeId: req.params.placeId,
            status: { $ne: 'Rejected' }
        })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: GET all reports
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const reports = await QueueReport.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('placeId', 'name type')
            .populate('reporterId', 'name email');
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
