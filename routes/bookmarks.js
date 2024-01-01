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
  let bookmarkedPosts = [];
  try {
    const user = await User.findOne({ email: req.session.user })
    .populate({
      path: 'bookmarked_posts',
      populate: {
          path: 'user'
      }
    })
    .exec();
    bookmarkedPosts = user.bookmarked_posts.slice(0, 30);
    res.render('bookmarks', { user, posts : bookmarkedPosts }); 
  } catch (err){
    next(err);
  }
});

router.post('/', loginCheck, async (req, res, next) => {
  const postId = req.body.postId;
  const email = req.session.user;
  try {
    const user = await User.findOne({ email: email });
    const post = await Post.findOne({ _id: postId })
      .catch(() => {
          return next(new Error('Post not found'));
      });
    if (user.bookmarked_posts.includes(postId)){
        user.bookmarked_posts.pull(postId);
        post.bookmarks.pull(user._id);
    } else {
        user.bookmarked_posts.push(postId);
        post.bookmarks.push(user._id);
    }
    await user.save();
    await post.save();
    return res.status(200).json({});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;