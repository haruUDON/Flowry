const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const User = require('../models/user.js').User;
const Post = require('../models/post.js').Post;
const Anime = require('../models/anime.js').Anime;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

router.get('/auth/check', async (req, res, next) => {
    if (req.session.user) {
        const user = await User.findOne({ _id: req.session.user })
        .populate({
          path: 'enthusiastic_anime'
        })
        .exec();
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
        ...(data.parent ? { parent_post: data.parent } : { parent_post: null }),
        ...(data.searchText && { text: new RegExp(data.searchText, 'i') }),
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

router.post('/profile/edit', upload.single('image'), async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: '名前を入力してください' });

    const user = await User.findOne({ _id: req.session.user });

    user.display_name = name;
    user.bio = bio;

    if (req.file && req.file.buffer){
      const resizedImage = await sharp(req.file.buffer)
      .resize({ width: 400, height: 400 })
      .toBuffer();

      const base64Image = resizedImage.toString('base64');
      user.icon = base64Image;
    }

    await user.save();

    res.status(200).json({ success: true, message: 'プロフィールを変更しました', user });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
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

const calculateFolderSize = (folderPath) => {
  const files = fs.readdirSync(folderPath);
  let totalSize = 0;
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const fileStats = fs.statSync(filePath);
    totalSize += fileStats.size;
  });
  return totalSize;
};

const MAX_STORAGE_SIZE = 10 * 1024 * 1024; //10MB

const generateHashedFileName = (file) => {
  const hash = crypto.createHash('sha256');
  hash.update(file.originalname + Date.now());
  return hash.digest('hex');
};

router.post('/posts/create', upload.single('image'), async (req, res, next) => {
  try {
    const data = req.body;

    let text = data.text;

    if (!text?.trim() && !req.file) return res.status(400).json({ message: '投稿内容を入力してください' });

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

    if (req.file){

      const userId = req.session.user;
      const userFolder = path.join(__dirname, '../uploads', userId);

      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      const currentFolderSize = calculateFolderSize(userFolder);

      const newFileSize = req.file.size;
      const newFolderSize = currentFolderSize + newFileSize;

      if (newFolderSize > MAX_STORAGE_SIZE) {
        return res.status(400).json({ message: '個人ストレージの上限に達しています' });
      }

      const hashedFileName = generateHashedFileName(req.file);
      const filePath = path.join(userFolder, `${hashedFileName}.${req.file.mimetype.split('/')[1]}`);

      fs.writeFileSync(filePath, req.file.buffer);

      postParams.image = `${hashedFileName}.${req.file.mimetype.split('/')[1]}`;
    }

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

async function deleteReplies(replies) {
  for (const replyId of replies) {
    const reply = await Post.findById(replyId).exec();
    if (!reply) continue;

    await deleteReplies(reply.replies);

    await Promise.all([
      User.updateMany({ liked_posts: replyId }, { $pull: { liked_posts: replyId } }),
      User.updateMany({ bookmarked_posts: replyId }, { $pull: { bookmarked_posts: replyId } }),
      User.updateMany({ "notifications.post": replyId }, { $pull: { notifications: { post: replyId } }}),
    ]);

    if (reply.image){
      const filePath = path.join(__dirname, '../uploads', reply.user.toString(), reply.image);
      await fs.unlinkSync(filePath);
    }

    await reply.deleteOne();
  }
}

router.post('/posts/delete', async (req, res, next) => {
  try {
    const postId = req.body.postId;
    const user = await User.findOne({ _id: req.session.user });

    const post = await Post.findOne({ _id: postId });
    if (!post) return res.status(400).json({ message: '投稿が見つかりませんでした' });

    if (!user._id.equals(post.user)) return res.status(403).json({ message: 'この操作に必要な権限がありません' });

    await Promise.all([
      User.updateMany({ liked_posts: postId }, { $pull: { liked_posts: postId } }),
      User.updateMany({ bookmarked_posts: postId }, { $pull: { bookmarked_posts: postId } }),
      User.updateMany({ "notifications.post": postId }, { $pull: { notifications: { post: postId } }}),
      Post.updateMany({ replies: postId }, { $pull: { replies: postId } }),
    ]);

    if (post.image){
      const filePath = path.join(__dirname, '../uploads', post.user.toString(), post.image);
      fs.unlinkSync(filePath);
    }

    await deleteReplies(post.replies);

    await post.deleteOne();

    res.status(200).json({ success: true, message: '投稿を削除しました' });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

router.post('/posts/report', async (req, res, next) => {
  try {
    const { postId, reason } = req.body;
    const user = await User.findOne({ _id: req.session.user });

    const post = await Post.findOne({ _id: postId });
    if (!post) return res.status(400).json({ message: '投稿が見つかりませんでした' });

    if (user._id.equals(post.user)) return res.status(403).json({ message: 'この操作に必要な権限がありません' });

    if (!reason) return res.status(400).json({ message: '報告する理由を選択してください' });

    post.reports.forEach(r => {
      if (user._id.equals(r.user)) post.reports.pull(r);
    });

    const report = {
      received_at: new Date(),
      type: reason,
      user: user._id,
    };

    post.reports.push(report);

    if (post.reports.length >= 5){
      const url = `${process.env.URL_ORIGIN}post/${post._id}`;
      const mailData = {
          from: "flowry.info@gmail.com",
          to: process.env.ADMIN_MAIL,
          subject: `複数の報告が寄せられている投稿があります`,
          text: `管理者様。\n\n下記の投稿に複数の報告が寄せられています。\n投稿内容の確認後、対処をご検討ください。\n\n${url}\n\n※本メールは自動送信メールとなりす。\n 本メールにご返信いただきましてもスタッフは確認ができません。\n\n※このメールに心当たりがない場合はメールを破棄してください。`
      };

      await transporter.sendMail(mailData);
    }

    await post.save();

    res.status(200).json({ success: true, message: '投稿の報告を受け付けました' });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

router.post('/posts/like', async (req, res, next) => {
  try {
    const { postId } = req.body;
    const user = await User.findOne({ _id: req.session.user });

    const post = await Post.findOne({ _id: postId });
    if (!post) return res.status(400).json({ message: '投稿が見つかりませんでした' });

    const postUser = await User.findOne({ _id: post.user });

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
        
        socket.emit('like', { postId, userId: user._id, postOwnerId: postUser._id });
      }
    }

    await user.save();
    await post.save();

    res.status(200).json({ success: true, message: '投稿をいいねしました', user });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

router.post('/notifications/get', async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.session.user })
    .populate({
        path: 'notifications',
        populate: [
            { path: 'user' },
            { path: 'post' }
        ]
    }).exec();

    user.notifications.forEach(n => {
      if (!n.is_read) n.is_read = true;
    });

    await user.save();

    const notifications = user.notifications;
    notifications.sort((a, b) => {
      return new Date(b.received_at) - new Date(a.received_at);
    });

    res.status(200).json({ success: true, message: '通知を取得しました', notifications });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

router.post('/enthusiastic/set', async (req, res, next) => {
  try {
    const anime = req.body.anime;
    const user = await User.findOne({ _id: req.session.user });

    user.enthusiastic_anime = anime;

    await user.save();

    if (!anime) return res.status(200).json({ success: true, message: '熱狂モードから退出しました', user });
    res.status(200).json({ success: true, message: '熱狂モードに突入しました', user });
  } catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;