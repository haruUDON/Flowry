const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    received_at: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['postLiked', 'userFollowed', 'postReplied'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    is_read: {
        type: Boolean,
        default: false
    }
});

module.exports = NotificationSchema;