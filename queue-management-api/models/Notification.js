import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // Who receives this
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null  // null = broadcast to all users in a place's queue
    },
    // Broadcast to everyone in a place's queue
    placeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        default: null
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'cancellation', 'system'],
        default: 'info'
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
