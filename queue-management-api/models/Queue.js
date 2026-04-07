import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    serviceId: {
        type: String,
        required: true
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
    status: {
        type: String,
        enum: ['waiting', 'serving', 'completed', 'cancelled'],
        default: 'waiting'
    }
}, {
    timestamps: true
});

const Queue = mongoose.model('Queue', queueSchema);
export default Queue;
