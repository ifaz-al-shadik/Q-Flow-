import express from 'express';
import Queue from '../models/Queue.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's active queues
// @route   GET /api/queues
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const queues = await Queue.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(queues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Join a queue
// @route   POST /api/queues
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { serviceId, serviceName, serviceType } = req.body;

        if (!serviceId || !serviceName || !serviceType) {
            return res.status(400).json({ message: 'Please provide all service details' });
        }

        // Check if user is already in this specific queue and waiting
        const existingQueue = await Queue.findOne({
            user: req.user._id,
            serviceId,
            status: 'waiting'
        });

        if (existingQueue) {
            return res.status(400).json({ message: 'You are already in this queue' });
        }

        // Simulate a queue position (between 3 and 10 for demo)
        const position = Math.floor(Math.random() * 8) + 3;
        const estimatedWait = position * 4; // 4 minutes per person

        const queue = await Queue.create({
            user: req.user._id,
            serviceId,
            serviceName,
            serviceType,
            position,
            estimatedWait,
            status: 'waiting'
        });

        res.status(201).json(queue);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Leave a queue (cancel)
// @route   DELETE /api/queues/:serviceId
// @access  Private
router.delete('/:serviceId', protect, async (req, res) => {
    try {
        const queue = await Queue.findOne({
            user: req.user._id,
            serviceId: req.params.serviceId,
            status: 'waiting'
        });

        if (!queue) {
            return res.status(404).json({ message: 'Queue not found' });
        }

        await queue.deleteOne();
        res.status(200).json({ id: req.params.serviceId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
