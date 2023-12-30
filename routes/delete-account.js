const express = require('express');
const router = express.Router();
const modelAuth = require('../models/auth.js');
const modelUser = require('../models/user.js');
const UserAuth = modelAuth.UserAuth; 
const User = modelUser.User;

router.get('/', function(req, res) {
    const email = req.session.user;
    if (!email) {
        res.redirect('/login');
    } else {
        res.render('delete-account');
    }
});

router.post('/', async (req, res) => {
    try {
        // ログインユーザーのIDを取得
        const email = req.session.user;
        // データベースからユーザーを削除
        const user = await User.findOne({ "email": email }); //先ほど取得板メールアドレスからUserに保存されている情報を取得
        if (user) {
            // ユーザーが見つかった場合のみ削除日時を設定して保存
            const now = new Date();
            user.deleted_at = now;
            await user.save();
            await UserAuth.findOneAndRemove({ "email": email }); //Authの情報は物理削除
            req.session.destroy();
            console.log('deleted session');
            res.redirect('/');
        } else {
            // ユーザーが見つからない場合はエラーを処理
            res.status(404).send('ユーザーが見つかりません。');
        }
        // ユーザーが削除されたらログアウトしてリダイレクト
    } catch (err) {
        console.log(err);
        res.status(500).send('アカウントの削除中にエラーが発生しました。');
    }
});

module.exports = router;