const mongoose = require('mongoose');
const NotificationSchema = require('./notification');

require('dotenv').config();

const UserSchema = new mongoose.Schema({
  display_name: String,
  bio: {
    type: String,
    default: ''
  },
  email  : String,
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
  socket_id  : String,
  icon: {
    type: String,
    default: process.env.INITIAL_ICON
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
  notifications: [ NotificationSchema ],
  enthusiastic_anime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anime',
    default: null
  },
  favorite_animes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime',
      default: []
    }
  ]
},{collection: 'user'});

exports.User = mongoose.model('User', UserSchema);