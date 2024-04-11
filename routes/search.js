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

router.get('/', loginCheck, async (req, res, next) => {
    try {
        let posts;
        const user = await User.findOne({ email: req.session.user });
        const searchText = req.query.q;
        if (!searchText) return res.render('search', { user, posts, searchText, file: 'search' });
        posts = await Post.find({ text: new RegExp(searchText, 'i') })
        .populate({ path: 'user' })
        .sort({ uploaded_at: 'desc' }).exec();
        res.status(200).render('search', { user, posts, searchText, file: 'search' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;