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

function getRandomItemsFromArray(arr, count) {
    return arr.slice().sort(() => Math.random() - 0.5).slice(0, count);
};

router.get('/', loginCheck, async (req, res) => {
    let selectedPosts = [];
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const query = {
        uploaded_at: { $gte: oneDayAgo },
        parent_post: null
    };
    try {
        const posts = await Post.find(query)
        .populate({
            path: 'user'
        })
        .exec();
        selectedPosts = getRandomItemsFromArray(posts, 30);
    } catch (err) {
        return next(err);
    }
    const user = await User.findOne({ "email": req.session.user });
    res.render('index', { user, posts: selectedPosts });
});

router.post('/', loginCheck, async (req, res) => {
    const socketId = req.body.socketId;
    const user = await User.findOne({ "email": req.session.user });
    user.socket_id = socketId;
    await user.save();
});

router.get('/post/:postId', loginCheck, async (req, res) => {
    const postId = req.params.postId;
    const email = req.session.user;
    try {
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
        .exec();
        const user = await User.findOne({ email: email});
        res.render('post', { post, user });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;