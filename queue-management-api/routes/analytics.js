import express from 'express';
import Place from '../models/Place.js';
import Queue from '../models/Queue.js';
import QueueReport from '../models/QueueReport.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { adminOnly, providerOrAdmin } from '../middleware/admin.js';

const router = express.Router();

// FR-18: Admin analytics dashboard data
router.get('/admin', protect, adminOnly, async (req, res) => {
    try {
        const [totalPlaces, totalUsers, totalReports, totalQueues, places] = await Promise.all([
            Place.countDocuments({ status: 'approved' }),
            User.countDocuments(),
            QueueReport.countDocuments(),
            Queue.countDocuments(),
            Place.find({ status: 'approved' })
        ]);

        const activeQueues = await Queue.countDocuments({ status: { $in: ['waiting', 'arrived'] } });
        const avgWait = places.length > 0
            ? Math.round(places.reduce((a, p) => a + p.currentWaitTime, 0) / places.length)
            : 0;

        const crowdDistribution = places.reduce((acc, p) => {
            acc[p.crowdStatus] = (acc[p.crowdStatus] || 0) + 1;
            return acc;
        }, { Low: 0, Medium: 0, High: 0, Closed: 0 });

        const topWaitTimes = [...places]
            .sort((a, b) => b.currentWaitTime - a.currentWaitTime)
            .slice(0, 5)
            .map(p => ({ name: p.name, waitTime: p.currentWaitTime, status: p.crowdStatus, liveCount: p.liveQueueCount }));

        // Peak hours from historical data
        const hourlyAvg = Array.from({ length: 24 }, (_, h) => {
            const samples = [];
            places.forEach(p => {
                p.historicalWaitTimes
                    .filter(hw => hw.hour === h)
                    .forEach(hw => samples.push(hw.avgWait));
            });
            return {
                hour: `${String(h).padStart(2, '0')}:00`,
                avgWait: samples.length > 0 ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0,
                sampleCount: samples.length
            };
        });

        res.json({
            totalPlaces,
            totalUsers,
            totalReports,
            totalQueues,
            activeQueues,
            avgWait,
            crowdDistribution,
            topWaitTimes,
            hourlyAvg
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// FR-19: Service Provider Dashboard
router.get('/provider/:placeId', protect, providerOrAdmin, async (req, res) => {
    try {
        const place = await Place.findById(req.params.placeId);
        if (!place) return res.status(404).json({ message: 'Place not found' });

        const [activeQueues, recentReports, totalCompleted] = await Promise.all([
            Queue.find({ serviceId: req.params.placeId, status: { $in: ['waiting', 'arrived'] } })
                .sort({ joinedAt: 1 }),
            QueueReport.find({ placeId: req.params.placeId })
                .sort({ createdAt: -1 })
                .limit(20),
            Queue.countDocuments({ serviceId: req.params.placeId, status: 'completed' })
        ]);

        const completedQueues = await Queue.find({
            serviceId: req.params.placeId,
            status: 'completed',
            actualWaitTime: { $ne: null }
        }).sort({ completedAt: -1 }).limit(50);

        const actualAvgWait = completedQueues.length > 0
            ? Math.round(completedQueues.reduce((a, q) => a + q.actualWaitTime, 0) / completedQueues.length)
            : place.currentWaitTime;

        // FR-12: Weekly heatmap data
        const weeklyHeatmap = Array.from({ length: 7 }, (_, day) =>
            Array.from({ length: 24 }, (_, hour) => {
                const data = place.historicalWaitTimes.find(h => h.hour === hour && h.dayOfWeek === day);
                return { day, hour, avgWait: data ? data.avgWait : 0, samples: data ? data.sampleCount : 0 };
            })
        ).flat();

        // FR-11: Best time recommendation
        const bestTimes = place.historicalWaitTimes
            .filter(h => h.sampleCount >= 2 && h.avgWait > 0)
            .sort((a, b) => a.avgWait - b.avgWait)
            .slice(0, 3)
            .map(h => ({
                hour: h.hour,
                dayOfWeek: h.dayOfWeek,
                avgWait: h.avgWait
            }));

        res.json({
            place,
            activeQueues,
            recentReports,
            totalCompleted,
            actualAvgWait,
            weeklyHeatmap,
            bestTimes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// FR-10 & FR-11: Waiting time prediction + best time for any place (public)
router.get('/predict/:placeId', async (req, res) => {
    try {
        const place = await Place.findById(req.params.placeId);
        if (!place) return res.status(404).json({ message: 'Place not found' });

        const now = new Date();
        const currentHour = now.getHours();
        const dayOfWeek = now.getDay();

        // Find prediction for current hour
        const currentPrediction = place.historicalWaitTimes.find(
            h => h.hour === currentHour && h.dayOfWeek === dayOfWeek
        );
        const predictedWait = currentPrediction
            ? Math.round(currentPrediction.avgWait * 0.7 + place.currentWaitTime * 0.3)
            : place.currentWaitTime;

        // Best times (lowest predicted wait, next 24 hours)
        const bestTimes = [];
        for (let offset = 0; offset < 24; offset++) {
            const targetHour = (currentHour + offset) % 24;
            const targetDay = dayOfWeek + (currentHour + offset >= 24 ? 1 : 0);
            const hist = place.historicalWaitTimes.find(
                h => h.hour === targetHour && h.dayOfWeek === targetDay % 7
            );
            bestTimes.push({
                hour: targetHour,
                offset,
                predictedWait: hist ? hist.avgWait : place.currentWaitTime,
                hasSamples: !!hist
            });
        }
        bestTimes.sort((a, b) => a.predictedWait - b.predictedWait);

        // FR-12: Hourly heatmap for this place
        const hourlyHeatmap = Array.from({ length: 24 }, (_, h) => {
            const data = place.historicalWaitTimes.filter(hw => hw.hour === h);
            const avgWait = data.length > 0
                ? Math.round(data.reduce((a, d) => a + d.avgWait, 0) / data.length)
                : 0;
            return { hour: h, label: `${String(h).padStart(2, '0')}:00`, avgWait, samples: data.reduce((a, d) => a + d.sampleCount, 0) };
        });

        res.json({
            currentWaitTime: place.currentWaitTime,
            predictedWait,
            liveQueueCount: place.liveQueueCount,
            crowdStatus: place.crowdStatus,
            bestTimes: bestTimes.slice(0, 5),
            hourlyHeatmap
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
