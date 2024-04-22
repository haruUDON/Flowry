const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    received_at: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['HATE_SPEECH', 'HARASSMENT', 'VIOLENT_CONTENT', 'CHILD_SAFETY', 'PRIVACY_VIOLATION', 'SPAM', 'SELF_HARM', 'SENSITIVE_CONTENT', 'FALSE_IDENTITY', 'VIOLENCE_HATE_SOURCE', 'SPOILER'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = ReportSchema;