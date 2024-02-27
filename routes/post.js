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

router.get('/:postId', loginCheck, async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const email = req.session.user;
        const post = await Post.findOne({ _id: postId })
        .populate([
            {
                path: 'user'
            },
            {
                path: 'replies',
                populate: {
                    path: 'user'
                }
            }
        ])
        .exec()
        .catch(() => {
            throw next(new Error('Post not found'));
        });
        const user = await User.findOne({ email: email});
        res.render('post', { post, user });
    } catch (err) {
        next(err);
    }
});

router.post('/', loginCheck, async (req, res, next) => {
    try {
        let text = req.body.text;
        if (!text) return res.redirect('/');
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        text = text.replace(
            /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)/gi,
            function(match) {
              if (match.length > 30) {
                  return '<a href="' + match + '">' + match.slice(0, 30) + '...</a>';
              } else {
                  return '<a href="' + match + '">' + match + '</a>';
              }
            }
        );
        const user = await User.findOne({ email: req.session.user });
        const now = new Date();
        const userId = user._id;
        const post = new Post({
            text: text,
            uploaded_at: now,
            parent_post: null,
            user: userId
        });
        await post.save();
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

router.post('/reply/:parentId', loginCheck, async (req, res, next) => {
    const text = req.body.text;
    const parentId = req.params.parentId;

    if (!text) return res.status(500).redirect('/post/' + parentId);

    try {
        const user = await User.findOne({ email: req.session.user });
        const parentPost = await Post.findOne({ _id: parentId });
        const parentUser = await User.findOne({ _id: parentPost.user });

        const now = new Date();
        const userId = user._id;

        const post = new Post({
            text: text,
            uploaded_at: now,
            parent_post: parentPost._id,
            user: userId
        });

        parentPost.replies.push(post._id);

        if (!parentUser._id.equals(user._id)) {
            const notification = {
                type: 'postReplied',
                post: post._id,
                user: user._id,
            };

            parentUser.notifications.push(notification);
            await parentUser.save();

            const socket_id = parentUser.socket_id;
            const unreadNotificationsCount = parentUser.notifications.filter(notification => !notification.is_read).length;
            req.io.to(socket_id).emit('notification', {
                count: unreadNotificationsCount,
            });
        }

        await parentPost.save();
        await post.save();

        res.status(200).redirect('/post/' + parentId);
    } catch (err) {
        next(err);
    }
});

router.post('/delete', loginCheck, async (req, res, next) => {
    const postId = req.body.postId;
    const email = req.session.user;
    try {
        const user = await User.findOne({ email: email });
        const post = await Post.findOne({ _id: postId })
        .catch(() => {
            return next(new Error('Post not found'));
        });
        if (user._id.toString() !== post.user.toString()) return next(new Error('Permission denied'));

        await User.updateMany({ liked_posts: postId }, { $pull: { liked_posts: postId } });
        await User.updateMany({ bookmarked_posts: postId }, { $pull: { bookmarked_posts: postId } });
        await User.updateMany({ "notifications.post": postId }, { $pull: { notifications: { post: postId } }});
        await Post.updateMany({ replies: postId }, { $pull: { replies: postId } });

        await Post.deleteOne({ _id: postId });

        return res.status(200).json({});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;