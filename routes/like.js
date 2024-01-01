const express = require('express');
const router = express.Router();
const modelUser = require('../models/user.js');
const modelPost = require('../models/post.js');
const User = modelUser.User;
const Post = modelPost.Post;

const loginCheck = (req, res, next) => {
    if(req.session.user){
        next();
    } else {
        res.redirect('/login');
    }
};

router.post('/', loginCheck, async (req, res, next) => {
    try {
        const postId = req.body.postId;
        const email = req.session.user;
        const user = await User.findOne({ email: email });

        const post = await Post.findOne({ _id: postId })
        .catch(() => {
            throw next(new Error('Post not found'));
        });

        const postUser = await User.findById(post.user);

        if (user.liked_posts.includes(postId)){
            user.liked_posts.pull(postId);
            post.likes.pull(user._id);
        } else {
            user.liked_posts.push(postId);
            post.likes.push(user._id);

            let found = postUser.notifications.some(object => 
                object.type === 'postLiked' && object.post.equals(post._id) && object.user.equals(user._id)
            );

            if (!found && !postUser._id.equals(user._id)){
                const notification = {
                    type: 'postLiked',
                    post: post._id,
                    user: user._id 
                }
                postUser.notifications.push(notification);
                await postUser.save();

                const socket_id = postUser.socket_id;
                const unreadNotificationsCount = postUser.notifications.filter(notification => notification.is_read === false).length;

                req.io.to(socket_id).emit('notification', { //新たに追加した部分
                    count: unreadNotificationsCount,
                });
            }
        }

        await user.save();
        await post.save();
        return res.status(200).json({});
      } catch (err) {
        next(err);
      }
});

module.exports = router;