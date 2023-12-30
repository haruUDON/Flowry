const express = require('express');
const router = express.Router();
const modelUser = require('../models/user.js');
const User = modelUser.User;

const loginCheck = (req, res, next) => {
    if(req.session.user){
        next();
    } else {
        res.redirect('/login');
    }
};

router.post('/', loginCheck, async (req, res) => {
    const targetId = req.body.userId;
    const email = req.session.user;
    console.log(targetId);
    try {
        // ユーザーを特定
        const user = await User.findOne({ email: email });
        // いいねする投稿を特定
        const target = await User.findById(targetId);
        if (!target) {
          res.render('error', { user, message: 'ユーザーが見つかりませんでした。'});
          return res.status(404);
        }
        if (user.following.includes(targetId)){
            user.following.pull(targetId);
            target.followers.pull(user._id);
        } else {
            user.following.push(targetId);
            target.followers.push(user._id);
            let found = false;
            target.notifications.forEach(object => {
                if (object.type === 'userFollowed'){
                    if (object.user.equals(user._id)){
                        found = true;
                        return;
                    }
                }
            })
            if (!found){
                const notification = {
                    type: 'userFollowed',
                    user: user._id,
                }
                target.notifications.push(notification);
            }
        }
        // ユーザーを保存
        await user.save();
        await target.save();
        return res.status(200).json({ message: 'ユーザーを「フォロー」しました' });
      } catch (error) {
        res.render('error', { user, message: '予期せぬエラーが発生しました。'});
        return res.status(500);
      }
});

module.exports = router;