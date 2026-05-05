import express from 'express';
import Notification from '../models/Notification.js';
import Queue from '../models/Queue.js';
import { protect } from '../middleware/auth.js';
import { providerOrAdmin } from '../middleware/admin.js';

const router = express.Router();

// Provider: Send broadcast notification to all visitors in a place's queue
router.post('/broadcast', protect, providerOrAdmin, async (req, res) => {
    try {
        const { placeId, placeName, title, message, type = 'info' } = req.body;
        if (!placeId || !message) {
            return res.status(400).json({ message: 'placeId and message are required' });
        }

        // Find all active queue users for this place
        const activeQueues = await Queue.find({
            serviceId: placeId,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        });

        if (activeQueues.length === 0) {
            return res.status(200).json({ message: 'No active visitors to notify', sent: 0 });
        }

        // Create individual notifications for each visitor
        const notifications = activeQueues.map(q => ({
            recipient: q.user,
            placeId,
            title: title || `Message from ${placeName || 'Service Provider'}`,
            message,
            type,
            sentBy: req.user._id,
            read: false
        }));

        const saved = await Notification.insertMany(notifications);
        res.status(201).json({ message: `Notification sent to ${saved.length} visitor(s)`, sent: saved.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User: Get my notifications
router.get('/my', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate('placeId', 'name type')
            .populate('sentBy', 'name');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User: Mark notification as read
router.patch('/:id/read', protect, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User: Mark all as read
router.patch('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unread count
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
