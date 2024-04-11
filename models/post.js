const mongoose = require('mongoose');
const ReportSchema = require('./report');

const PostSchema = new mongoose.Schema({
    text  : String,
    uploaded_at  : Date,
    parent_post  : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' 
    },
    user  : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
    likes  : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    bookmarks  : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    replies  : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            default: []
        }
    ],
    reports: [ ReportSchema ]
},{collection: 'posts'});

exports.Post = mongoose.model('Post', PostSchema);