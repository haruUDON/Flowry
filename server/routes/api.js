const express = require('express');
const router = express.Router();
const User = require('../models/user.js').User;
const Post = require('../models/post.js').Post;
const Anime = require('../models/anime.js').Anime;

router.get('/auth/check', async (req, res, next) => {
    if (req.session.user) {
        const user = await User.findOne({ _id: req.session.user });
        res.status(200).json({ isAuthenticated: true, user });
    } else {
        res.status(201).json({ isAuthenticated: false });
    }
});

router.post('/timeline', async (req, res, next) => {
    const data = req.body.query;
    const query = {
        ...(data.fromDate && { uploaded_at: { $gte: data.fromDate } }),
        ...(data.user && { user: data.user }),
        ...(data.parent ? { parent_post: data.parent } : { parent_post: null })
    };
    let postsQuery = Post.find(query)
        .populate({
            path: 'user'
        });

    if (data.sort) {
        postsQuery = postsQuery.sort({ uploaded_at: data.sort });
    }

    if (data.gotPosts && data.gotPosts.length > 0) {
        postsQuery = postsQuery.where('_id').nin(data.gotPosts);
    }

    postsQuery = postsQuery.limit(30);

    const posts = await postsQuery.exec();
    res.json({ posts });
});

router.post('/profile', async (req, res, next) => {
    const id = req.body.userId;
    const user = await User.findOne({ _id: id });
    res.json({ user });
});

router.post('/post', async (req, res, next) => {
    const id = req.body.postId;
    const post = await Post.findOne({ _id: id })
    .populate({
        path: 'user'
    })
    .exec();
    res.json({ post });
});

router.post('/anime', async (req, res, next) => {
  const search = req.body.search;
  const gotAnimeIds = req.body.gotAnimeIds;
  const anime = await Anime.find({
    $or: [
      { title: new RegExp(search, 'i') },
      { title_kana: new RegExp(search, 'i') }
    ]
  })
  .sort({ watchers_count: 'desc' })
  .where('_id').nin(gotAnimeIds)
  .limit(30)
  .exec();
  res.json({ anime });
});

router.post('/posts/create', async (req, res, next) => {
  try {
    const data = req.body;

    let text = data.text;

    if (!text?.trim()) return res.status(400).json({ message: '投稿内容を入力してください' });

    const user = await User.findOne({ _id: req.session.user });

    let parentPost = null;
    if (data.parentId){
      parentPost = await Post.findOne({ _id: data.parentId });
      if (!parentPost) return res.status(400).json({ message: '返信先の投稿が存在しません' });
    }

    let parentUser = null;
    if (parentPost){
      parentUser = await User.findOne({ _id: parentPost.user });
      if (parentUser.deleted_at || !parentUser) return res.status(400).json({ message: '返信先のユーザーが存在しません' });
    }

    const now = new Date();

    const postParams = {
      text: text,
      uploaded_at: now,
      user: user._id,
    };

    (parentPost ? postParams.parent_post = parentPost._id : postParams.parent_post = null);

    const post = new Post(postParams);

    if (parentPost) {
      parentPost.replies.push(post._id);

      if (!parentUser._id.equals(user._id)){
        const notification = {
          type: 'postReplied',
          post: post._id,
          user: user._id,
        };
    
        parentUser.notifications.push(notification);
        await parentUser.save();
      }

      await parentPost.save();
    }

    await post.save();

    res.status(200).json({ success: true, message: '投稿に成功しました' });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

router.post('/posts/delete', async (req, res, next) => {
  try {
    const data = req.body;

    let text = data.text;

    if (!text?.trim()) return res.status(400).json({ message: '投稿内容を入力してください' });

    const user = await User.findOne({ _id: req.session.user });

    let parentPost = null;
    if (data.parentId){
      parentPost = await Post.findOne({ _id: data.parentId });
      if (!parentPost) return res.status(400).json({ message: '返信先の投稿が存在しません' });
    }

    let parentUser = null;
    if (parentPost){
      parentUser = await User.findOne({ _id: parentPost.user });
      if (parentUser.deleted_at || !parentUser) return res.status(400).json({ message: '返信先のユーザーが存在しません' });
    }

    const now = new Date();

    const postParams = {
      text: text,
      uploaded_at: now,
      user: user._id,
    };

    (parentPost ? postParams.parent_post = parentPost._id : postParams.parent_post = null);

    const post = new Post(postParams);

    if (parentPost) {
      parentPost.replies.push(post._id);

      if (!parentUser._id.equals(user._id)){
        const notification = {
          type: 'postReplied',
          post: post._id,
          user: user._id,
        };
    
        parentUser.notifications.push(notification);
        await parentUser.save();
      }

      await parentPost.save();
    }

    await post.save();

    res.status(200).json({ success: true, message: '投稿に成功しました' });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;