import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    queueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500, default: '' },
}, { timestamps: true });

// One rating per queue visit
ratingSchema.index({ queueId: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
