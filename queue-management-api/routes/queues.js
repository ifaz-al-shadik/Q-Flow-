import express from 'express';
import Queue from '../models/Queue.js';
import Place from '../models/Place.js';
import { protect } from '../middleware/auth.js';
import { providerOrAdmin } from '../middleware/admin.js';

const router = express.Router();

// Crowd thresholds for FR-8
const getCrowdStatus = (count) => {
    if (count <= 5) return 'Low';
    if (count <= 15) return 'Medium';
    return 'High';
};

// GET user's active queues
router.get('/', protect, async (req, res) => {
    try {
        const queues = await Queue.find({
            user: req.user._id,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        }).sort({ joinedAt: -1 });
        res.status(200).json(queues);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// FR-7: GET live queue count for a place
router.get('/live/:serviceId', async (req, res) => {
    try {
        const count = await Queue.countDocuments({
            serviceId: req.params.serviceId,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        });
        const crowdStatus = getCrowdStatus(count);
        res.json({ liveCount: count, crowdStatus });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// JOIN a queue (FR-4 initial join)
router.post('/', protect, async (req, res) => {
    try {
        const { serviceId, serviceName, serviceType } = req.body;

        if (!serviceId || !serviceName || !serviceType) {
            return res.status(400).json({ message: 'Please provide all service details' });
        }

        const existingQueue = await Queue.findOne({
            user: req.user._id,
            serviceId,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        });

        if (existingQueue) {
            return res.status(400).json({ message: 'You are already in this queue' });
        }

        // Count how many are ahead
        const position = await Queue.countDocuments({
            serviceId,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        }) + 1;

        // FR-9: Use place's current wait time per person
        const place = await Place.findById(serviceId);
        const waitPerPerson = place ? Math.max(3, Math.round(place.currentWaitTime / Math.max(1, position - 1 || 1))) : 4;
        const estimatedWait = position * waitPerPerson;

        const queue = await Queue.create({
            user: req.user._id,
            serviceId,
            serviceName,
            serviceType,
            position,
            estimatedWait,
            joinedAt: new Date(),
            status: 'waiting'
        });

        // FR-7: Update place's live queue count and crowd status
        const newCount = position;
        await Place.findByIdAndUpdate(serviceId, {
            liveQueueCount: newCount,
            crowdStatus: getCrowdStatus(newCount),
            lastUpdated: new Date()
        });

        res.status(201).json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// FR-4: 'I Arrived' — mark as arrived
router.patch('/:id/arrive', protect, async (req, res) => {
    try {
        const queue = await Queue.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'waiting'
        });

        if (!queue) return res.status(404).json({ message: 'Queue entry not found' });

        queue.status = 'arrived';
        queue.arrivedAt = new Date();
        await queue.save();

        res.json(queue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// FR-5: 'My Turn Finished' — calculate actual wait time
router.patch('/:id/complete', protect, async (req, res) => {
    try {
        const queue = await Queue.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        });

        if (!queue) return res.status(404).json({ message: 'Queue entry not found' });

        const completedAt = new Date();
        const startTime = queue.arrivedAt || queue.joinedAt;
        const actualWaitTime = Math.round((completedAt - startTime) / 60000); // minutes

        queue.status = 'completed';
        queue.completedAt = completedAt;
        queue.actualWaitTime = actualWaitTime;
        await queue.save();

        // FR-6: Update place's wait time based on actual data
        const place = await Place.findById(queue.serviceId);
        if (place) {
            // Weighted average: 70% old, 30% new actual
            const newWaitTime = Math.round(place.currentWaitTime * 0.7 + actualWaitTime * 0.3);
            const newCount = Math.max(0, (place.liveQueueCount || 1) - 1);

            // FR-20: Store historical data
            const now = new Date();
            const hour = now.getHours();
            const dayOfWeek = now.getDay();
            const existing = place.historicalWaitTimes.find(
                h => h.hour === hour && h.dayOfWeek === dayOfWeek
            );
            if (existing) {
                existing.avgWait = Math.round((existing.avgWait * existing.sampleCount + actualWaitTime) / (existing.sampleCount + 1));
                existing.sampleCount += 1;
            } else {
                place.historicalWaitTimes.push({ hour, dayOfWeek, avgWait: actualWaitTime, sampleCount: 1 });
            }

            place.currentWaitTime = newWaitTime;
            place.liveQueueCount = newCount;
            place.crowdStatus = getCrowdStatus(newCount);
            place.totalVisitors = (place.totalVisitors || 0) + 1;
            place.lastUpdated = new Date();
            await place.save();
        }

        res.json({ ...queue.toObject(), actualWaitTime });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// CANCEL / Leave queue
router.delete('/:serviceId', protect, async (req, res) => {
    try {
        const queue = await Queue.findOne({
            user: req.user._id,
            serviceId: req.params.serviceId,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        });

        if (!queue) return res.status(404).json({ message: 'Queue not found' });

        queue.status = 'cancelled';
        await queue.save();

        // FR-7: Decrement live count
        await Place.findByIdAndUpdate(req.params.serviceId, {
            $inc: { liveQueueCount: -1 },
            lastUpdated: new Date()
        });

        res.status(200).json({ id: req.params.serviceId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Provider: GET live stats for a place (visitor count + total queue time)
router.get('/stats/:serviceId', protect, providerOrAdmin, async (req, res) => {
    try {
        const activeQueues = await Queue.find({
            serviceId: req.params.serviceId,
            status: { $in: ['waiting', 'arrived', 'serving'] }
        }).sort({ position: 1 });

        const totalQueueTime = activeQueues.reduce((sum, q) => sum + (q.estimatedWait || 0), 0);
        const arrivedCount = activeQueues.filter(q => q.status === 'arrived').length;

        res.json({
            liveCount: activeQueues.length,
            arrivedCount,
            waitingCount: activeQueues.filter(q => q.status === 'waiting').length,
            totalQueueTime,
            avgWaitPerPerson: activeQueues.length > 0 ? Math.round(totalQueueTime / activeQueues.length) : 0,
            queue: activeQueues
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Provider: Remove a specific visitor from queue
router.delete('/provider/remove/:queueId', protect, providerOrAdmin, async (req, res) => {
    try {
        const queue = await Queue.findById(req.params.queueId);
        if (!queue) return res.status(404).json({ message: 'Queue entry not found' });

        queue.status = 'cancelled';
        await queue.save();

        // Decrement live count on the place
        await Place.findByIdAndUpdate(queue.serviceId, {
            $inc: { liveQueueCount: -1 },
            lastUpdated: new Date()
        });

        res.json({ message: 'Visitor removed from queue', queueId: req.params.queueId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
