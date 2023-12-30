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

router.get('/:userId', loginCheck, async (req, res) => {
  const email = req.session.user;
  const userId = req.params.userId;
  await User.findOne({ _id: userId })
  .then(async urlUser => {
    if (urlUser) {
      const posts = await Post.find({ user: userId })
      .populate({
        path: 'user',
      })
      .sort({ uploaded_at: 'desc' }).exec();
      const user = await User.findOne({ email: email });
      res.render('profile', { user, urlUser, posts : posts.slice(0, 30) });
    } else {
      res.redirect('/');
    }
  })
  .catch(() => {
    res.redirect('/');
  });
});

router.post('/', loginCheck, upload.single('image'), async (req, res) => {
  try {
    const email = req.session.user;
    const displayName = req.body.displayName;
    const biography = req.body.biography;
    const user = await User.findOne({ "email": email });
    user.display_name = displayName;
    user.bio = biography;
    if (displayName === '') return res.redirect('/profile/' + user._id);
    if (req.file.buffer){
      // 画像のリサイズ
      const resizedImage = await sharp(req.file.buffer)
      .resize({ width: 400, height: 400, fit: 'cover' })
      .toBuffer();

      // BASE64エンコード
      const base64Image = resizedImage.toString('base64');

      // MongoDBに保存
      user.icon = base64Image;
    }
    await user.save()
    .then(() => {
        res.redirect('/profile/' + user._id);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;