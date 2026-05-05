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
    reporterName: {
        type: String,
        default: 'Anonymous'
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
    // FR-17: Closed / Overcrowded Reporting
    reportType: {
        type: String,
        enum: ['wait_time', 'closed', 'overcrowded', 'data_correction'],
        default: 'wait_time'
    },
    note: {
        type: String,
        default: ''
    },
    // FR-16: Queue Data Verification
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifications: {
        type: Number,
        default: 0  // how many users confirmed this report
    },
    disputes: {
        type: Number,
        default: 0  // how many users disputed this
    }
}, { timestamps: true });

export default mongoose.model('QueueReport', queueReportSchema);
