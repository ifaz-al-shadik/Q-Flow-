import express from 'express';
import Place from '../models/Place.js';

const router = express.Router();

// GET all places
router.get('/', async (req, res) => {
    try {
        const places = await Place.find();
        res.json(places);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET place by ID
router.get('/:id', async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ message: 'Place not found' });
        res.json(place);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new place
router.post('/', async (req, res) => {
    const place = new Place(req.body);
    try {
        const savedPlace = await place.save();
        res.status(201).json(savedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
