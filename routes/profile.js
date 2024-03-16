const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const modelUser = require('../models/user.js');
const modelPost = require('../models/post.js');
const User = modelUser.User;
const Post = modelPost.Post;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const loginCheck = (req, res, next) => {
  if(req.session.user){
      next();
  } else {
      res.redirect('/login');
  }
};

router.get('/:userId', loginCheck, async (req, res, next) => {
  try {
    const email = req.session.user;
    const userId = req.params.userId;
    const urlUser = await User.findOne({ _id: userId })
    .catch(() => {
      throw next(new Error('User not found'));
    });

    if (urlUser.deleted_at) throw next(new Error('User was deleted'));

    const posts = await Post.find({ user: userId })
      .populate({ path: 'user' })
      .sort({ uploaded_at: 'desc' }).exec();

    const user = await User.findOne({ email: email });
    res.render('profile', { user, urlUser, posts: posts.slice(0, 30) });
  } catch (err) {
    next(err);
  }
});

router.post('/', loginCheck, upload.single('image'), async (req, res, next) => {
  try {
    const email = req.session.user;
    const displayName = req.body.displayName;
    const biography = req.body.biography;
    const user = await User.findOne({ email: email });

    user.display_name = displayName;
    user.bio = biography;

    if (displayName === '') {
      return res.redirect('/profile/' + user._id);
    }

    if (req.file && req.file.buffer) {
      const resizedImage = await sharp(req.file.buffer)
        .resize({ width: 400, height: 400, fit: 'cover' })
        .toBuffer();

      const base64Image = resizedImage.toString('base64');
      user.icon = base64Image;
    }

    await user.save();
    res.redirect('/profile/' + user._id);

  } catch (err) {
    next(err);
  }
});

module.exports = router;