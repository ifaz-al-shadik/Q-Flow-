import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Place'
    },
    serviceName: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    estimatedWait: {
        type: Number,
        required: true
    },
    // FR-4: Queue Check-In timestamp
    joinedAt: {
        type: Date,
        default: Date.now
    },
    // FR-4: 'I Arrived' button timestamp
    arrivedAt: {
        type: Date,
        default: null
    },
    // FR-5: 'My Turn Finished' timestamp
    completedAt: {
        type: Date,
        default: null
    },
    // FR-5 & FR-6: Actual calculated wait time in minutes
    actualWaitTime: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['waiting', 'arrived', 'serving', 'completed', 'cancelled'],
        default: 'waiting'
    }
}, {
    timestamps: true
});

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
