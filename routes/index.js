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

const getRandomItemsFromArray = (arr, count) => {
    return arr.slice().sort(() => Math.random() - 0.5).slice(0, count);
};

router.get('/', loginCheck, async (req, res, next) => {
    let selectedPosts = [];
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 3);
    const query = {
        uploaded_at: { $gte: oneDayAgo },
        parent_post: null
    };
    try {
        const user = await User.findOne({ email: req.session.user });
        const posts = await Post.find(query)
        .populate({
            path: 'user'
        })
        .exec();
        selectedPosts = getRandomItemsFromArray(posts, 30);
        res.render('index', { user, posts: selectedPosts, file: 'index' });
    } catch (err) {
        return next(err);
    }
});

router.post('/', loginCheck, async (req, res) => {
    try {
        const socketId = req.body.socketId;
        const user = await User.findOne({ email: req.session.user });
        user.socket_id = socketId;
        await user.save();   
    } catch (err) {
        next(err);
    }
});

module.exports = router;