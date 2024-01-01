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

router.post('/', loginCheck, async (req, res, next) => {
    try {
        const targetId = req.body.userId;
        const email = req.session.user;

        const user = await User.findOne({ email: email });

        const target = await User.findById(targetId)
        .catch(() => {
            throw next(new Error('User not found'));
        });

        if (user.following.includes(targetId)){
            user.following.pull(targetId);
            target.followers.pull(user._id);
        } else {
            user.following.push(targetId);
            target.followers.push(user._id);
            
            let found = target.notifications.some(object => 
                object.type === 'userFollowed' && object.user.equals(user._id)
            );

            if (!found){
                const notification = {
                    type: 'userFollowed',
                    user: user._id,
                }
                target.notifications.push(notification);
                await target.save();

                const socket_id = target.socket_id;
                const unreadNotificationsCount = target.notifications.filter(notification => !notification.is_read).length;
                req.io.to(socket_id).emit('notification', {
                    count: unreadNotificationsCount,
                });
            }
        }
        // ユーザーを保存
        await user.save();
        return res.status(200).json({});
      } catch (err) {
        next(err);
      }
});

module.exports = router;