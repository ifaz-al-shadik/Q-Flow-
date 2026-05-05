import express from 'express';
import User from '../models/User.js';
import Place from '../models/Place.js';
import Queue from '../models/Queue.js';
import QueueReport from '../models/QueueReport.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// Admin: Get all users (with optional role filter)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get visitor workflow — queues + reports for a specific visitor
router.get('/:id/activity', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [queues, reports] = await Promise.all([
            Queue.find({ user: req.params.id })
                .populate('serviceId', 'name type address')
                .sort({ joinedAt: -1 })
                .limit(20),
            QueueReport.find({ reporter: req.params.id })
                .populate('placeId', 'name type')
                .sort({ createdAt: -1 })
                .limit(20),
        ]);

        res.json({ user, queues, reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get provider workflow — places + active queues + sent notifications
router.get('/:id/provider-activity', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const [places, sentNotifications] = await Promise.all([
            Place.find({ addedBy: req.params.id }),
            Notification.find({ sentBy: req.params.id })
                .populate('placeId', 'name')
                .sort({ createdAt: -1 })
                .limit(20),
        ]);

        // Active queues across all provider's places
        const placeIds = places.map(p => p._id);
        const activeQueues = await Queue.find({
            serviceId: { $in: placeIds },
            status: { $in: ['waiting', 'arrived', 'serving'] }
        }).populate('serviceId', 'name').sort({ joinedAt: -1 }).limit(50);

        res.json({ user, places, activeQueues, sentNotifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Add a visitor to a queue manually
router.post('/queue/add', protect, adminOnly, async (req, res) => {
    try {
        const { userId, serviceId } = req.body;
        if (!userId || !serviceId) return res.status(400).json({ message: 'userId and serviceId required' });

        const place = await Place.findById(serviceId);
        if (!place) return res.status(404).json({ message: 'Place not found' });

        // Check if already in queue
        const existing = await Queue.findOne({ user: userId, serviceId, status: { $in: ['waiting', 'arrived'] } });
        if (existing) return res.status(400).json({ message: 'User already in this queue' });

        const lastQueue = await Queue.findOne({ serviceId, status: { $in: ['waiting', 'arrived'] } }).sort({ position: -1 });
        const position = lastQueue ? lastQueue.position + 1 : 1;
        const estimatedWait = place.currentWaitTime + (position - 1) * 5;

        const queue = new Queue({
            user: userId, serviceId, position, estimatedWait,
            status: 'waiting', joinedAt: new Date()
        });
        await queue.save();

        await Place.findByIdAndUpdate(serviceId, { $inc: { liveQueueCount: 1 }, lastUpdated: new Date() });

        res.status(201).json(queue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Remove a visitor from any queue
router.delete('/queue/:queueId', protect, adminOnly, async (req, res) => {
    try {
        const queue = await Queue.findById(req.params.queueId);
        if (!queue) return res.status(404).json({ message: 'Queue entry not found' });
        queue.status = 'cancelled';
        await queue.save();
        await Place.findByIdAndUpdate(queue.serviceId, { $inc: { liveQueueCount: -1 }, lastUpdated: new Date() });
        res.json({ message: 'Visitor removed from queue' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update user role
router.patch('/:id/role', protect, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['visitor', 'reporter', 'provider', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Delete any user (with optional cascade)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { removePlaces } = req.query;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Cancel their active queues
        await Queue.updateMany({ user: req.params.id, status: { $in: ['waiting', 'arrived'] } }, { status: 'cancelled' });

        if (removePlaces === 'true') {
            const places = await Place.find({ addedBy: req.params.id });
            for (const place of places) {
                await Queue.updateMany({ serviceId: place._id, status: { $in: ['waiting', 'arrived'] } }, { status: 'cancelled' });
            }
            await Place.deleteMany({ addedBy: req.params.id });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
