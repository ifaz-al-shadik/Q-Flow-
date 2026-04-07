import mongoose from 'mongoose';

const queueReportSchema = new mongoose.Schema({
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedWaitTime: {
        type: Number,
        required: true
    },
    reportedCrowdStatus: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Closed'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

export default mongoose.model('QueueReport', queueReportSchema);
