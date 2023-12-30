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

router.post('/', loginCheck, async (req, res) => {
    const postId = req.body.postId;
    const email = req.session.user;
    const user = await User.findOne({ email: email });
    try {
        // いいねする投稿を特定
        const post = await Post.findById(postId);
        if (!post) {
          res.render('error', { user, message: '投稿が見つかりませんでした。'});
          return res.status(404);
        }
        const postUser = await User.findById(post.user);
        // ユーザーの liked_posts 配列に新しい投稿 ID を追加
        if (user.liked_posts.includes(postId)){
            user.liked_posts.pull(postId);
            post.likes.pull(user._id);
        } else {
            user.liked_posts.push(postId);
            post.likes.push(user._id);
            //通知関連
            let found = false;
            postUser.notifications.forEach(object => {
                if (object.type === 'postLiked'){
                    if(object.post.equals(post._id) && object.user.equals(user._id)){
                        found = true;
                        return;
                    }
                }
            })
            if (!found){
                if (!postUser._id.equals(user._id)){
                    const notification = {
                        type: 'postLiked',
                        post: post._id,
                        user: user._id 
                    }
                    postUser.notifications.push(notification);
                    await postUser.save();
                    const socket_id = postUser.socket_id;
                    console.log(req.io);
                    console.log(socket_id);
                    try {
                        const unreadNotificationsCount = postUser.notifications.filter(notification => notification.is_read === false).length;
                        req.io.to(socket_id).emit('notification', { //新たに追加した部分
                            count: unreadNotificationsCount,
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        //ユーザー保存
        await user.save();
        await post.save();
        return res.status(200).json({ message: '投稿を「いいね」しました' });
      } catch (error) {
        res.render('error', { user, message: '予期せぬエラーが発生しました。'});
        return res.status(500);
      }
});

module.exports = router;