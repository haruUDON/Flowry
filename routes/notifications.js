const express = require('express');
const router = express.Router();
const modelUser = require('../models/user.js');
const User = modelUser.User;

const loginCheck = (req, res, next) => {
    if(req.session.user){
        next();
    } else {
        res.redirect('/login');
    }
};

router.get('/', loginCheck, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.session.user })
    .populate({
        path: 'notifications',
        populate: [
            { path: 'user' },
            { path: 'post' }
        ]
    }).exec();
    user.notifications.forEach(n => {
      if (!n.is_read) n.is_read = true;
    });
    await user.save();
    const notifications = user.notifications;
    notifications.sort((a, b) => {
      return new Date(b.received_at) - new Date(a.received_at);
    });
    res.render('notifications', { user, notifications : notifications }); 
  } catch (err) {
    next(err);
  }
});

module.exports = router;