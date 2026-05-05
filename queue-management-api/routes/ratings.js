import express from 'express';
import Rating from '../models/Rating.js';
import Place from '../models/Place.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST: Submit a rating after completing a queue
router.post('/', protect, async (req, res) => {
    try {
        const { placeId, queueId, stars, comment } = req.body;
        if (!placeId || !queueId || !stars) {
            return res.status(400).json({ message: 'placeId, queueId, and stars are required' });
        }
        // Prevent duplicate ratings
        const existing = await Rating.findOne({ queueId });
        if (existing) return res.status(400).json({ message: 'You already rated this visit' });

        const rating = await Rating.create({
            user: req.user._id, placeId, queueId,
            stars: Math.min(5, Math.max(1, stars)),
            comment: comment || ''
        });

        // Update place average rating
        const all = await Rating.find({ placeId });
        const avg = all.reduce((s, r) => s + r.stars, 0) / all.length;
        await Place.findByIdAndUpdate(placeId, {
            avgRating: Math.round(avg * 10) / 10,
            totalRatings: all.length
        });

        res.status(201).json(rating);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Already rated this visit' });
        res.status(500).json({ message: error.message });
    }
});

// GET: Ratings for a place (public)
router.get('/place/:placeId', async (req, res) => {
    try {
        const ratings = await Rating.find({ placeId: req.params.placeId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);
        const avg = ratings.length
            ? Math.round(ratings.reduce((s, r) => s + r.stars, 0) / ratings.length * 10) / 10
            : 0;
        res.json({ ratings, avg, total: ratings.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET: Check if user already rated a specific queue visit
router.get('/check/:queueId', protect, async (req, res) => {
    try {
        const existing = await Rating.findOne({ queueId: req.params.queueId, user: req.user._id });
        res.json({ rated: !!existing, rating: existing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
