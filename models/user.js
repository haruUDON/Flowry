const mongoose = require('mongoose');
const NotificationSchema = require('./notification');

const UserSchema = new mongoose.Schema({
    display_name  : String,
    bio  : String,
    email  : String,
    created_at  : Date,
    updated_at  : Date,
    deleted_at  : Date,
    socket_id  : String,
    icon: { //BASE64
        type: String,
    },
    liked_posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            default: []
        }
    ],
    bookmarked_posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            default: []
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    notifications: [ NotificationSchema ]
},{collection: 'user'});

exports.User = mongoose.model('User', UserSchema);