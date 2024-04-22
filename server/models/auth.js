const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
    email  : String,
    password  : String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: {
        type: Date,
        default: null
    },
},{collection: 'user_auth'});

exports.UserAuth = mongoose.model('UserAuth', UserAuthSchema);