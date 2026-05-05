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
    address: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    operatingHours: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '17:00' },
        days: { type: String, default: 'Sun–Thu' }
    },
    services: [{
        type: String
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true  // [longitude, latitude]
        }
    },
    currentWaitTime: {
        type: Number,
        default: 0  // minutes
    },
    liveQueueCount: {
        type: Number,
        default: 0  // FR-7: live number of people in queue
    },
    crowdStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Closed'],
        default: 'Low'
    },
    // FR-10: Historical wait time data for prediction
    historicalWaitTimes: [{
        hour: Number,       // 0-23
        dayOfWeek: Number,  // 0=Sunday
        avgWait: Number,
        sampleCount: Number
    }],
    // FR-18/FR-20: Analytics
    totalVisitors: {
        type: Number,
        default: 0
    },
    avgRating: {
        type: Number,
        default: 0
    },
    totalReports: {
        type: Number,
        default: 0
    },
    // FR-1: Admin approval workflow
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'closed'],
        default: 'approved'  // seed data is auto-approved
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

placeSchema.index({ location: '2dsphere' });
placeSchema.index({ name: 'text', type: 'text', address: 'text' });

export default mongoose.model('Place', placeSchema);
