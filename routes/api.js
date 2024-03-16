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

router.get('/notifications/unread-count', loginCheck, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.session.user });
        if (!user) {
            return res.json({ unreadCount: 0 });
        }
        const unreadCount = user.notifications.filter(notification => !notification.is_read).length;
        res.json({ unreadCount });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;