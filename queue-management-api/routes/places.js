import express from 'express';
import Place from '../models/Place.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// FR-3: GET all places with search and filter
router.get('/', async (req, res) => {
    try {
        const { search, type } = req.query;
        // Show approved places OR places without a status field (legacy seed data)
        const filter = { $or: [{ status: 'approved' }, { status: { $exists: false } }] };

        if (type && type !== 'All') filter.type = type;

        if (search && search.trim()) {
            filter.$and = [
                { $or: [{ status: 'approved' }, { status: { $exists: false } }] },
                { $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } },
                    { type: { $regex: search, $options: 'i' } }
                ]}
            ];
            delete filter.$or;
        }

        const places = await Place.find(filter).sort({ currentWaitTime: -1 });
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// FR-18: Admin - get ALL places including pending
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const places = await Place.find().sort({ createdAt: -1 });
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// FR-15: Nearest fastest service
router.get('/nearest', async (req, res) => {
    try {
        const { lat, lng, maxDistance = 10000 } = req.query;
        if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

        const places = await Place.find({
            status: 'approved',
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).limit(5);

        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET place by ID (FR-2: Place Profile Page)
router.get('/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ message: 'Place not found' });
        res.json(place);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// FR-1: POST new place (any logged-in user can suggest; requires admin approval)
router.post('/', protect, async (req, res) => {
    try {
        const {
            name, type, address, description, phone, operatingHours,
            services, location, imageUrl
        } = req.body;

        // Admins auto-approve; regular users need approval
        const status = req.user.role === 'admin' ? 'approved' : 'pending';

        const place = new Place({
            name, type, address, description, phone,
            operatingHours, services: services || [], location, imageUrl,
            status,
            addedBy: req.user._id
        });

        const savedPlace = await place.save();
        res.status(201).json(savedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// FR-1 / Admin: PATCH place (update details)
router.patch('/:id', protect, adminOnly, async (req, res) => {
    try {
        const updated = await Place.findByIdAndUpdate(
            req.params.id,
            { ...req.body, lastUpdated: new Date() },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: 'Place not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// FR-1: Admin - approve / reject a place
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' | 'rejected'
        const updated = await Place.findByIdAndUpdate(
            req.params.id,
            { status, lastUpdated: new Date() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Place not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: DELETE place
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deleted = await Place.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Place not found' });
        res.json({ message: 'Place deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
