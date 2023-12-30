const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
    email  : String,
    password  : String,
    created_at  : Date,
    updated_at  : Date,
    deleted_at  : Date
},{collection: 'user_auth'});

exports.UserAuth = mongoose.model('UserAuth', UserAuthSchema);