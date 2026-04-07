import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Public Service', 'Healthcare', 'Government', 'Retail', 'Education', 'Financial', 'Other']
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true // [longitude, latitude]
        }
    },
    currentWaitTime: {
        type: Number, // In minutes
        default: 0
    },
    crowdStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Closed'],
        default: 'Low'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

placeSchema.index({ location: '2dsphere' });

export default mongoose.model('Place', placeSchema);
