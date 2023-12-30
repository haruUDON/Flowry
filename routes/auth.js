const express = require('express');
const router = express.Router();
const modelTmp = require('../models/tmp.js');
const modelUser = require('../models/user.js');
const modelAuth = require('../models/auth.js');
const UserTmp = modelTmp.UserTmp;
const User = modelUser.User;
const UserAuth = modelAuth.UserAuth;


router.get('/email/:token', async function(req, res, next){
    const now = new Date();
    if (now.getTime() > parseInt(req.query.expires)){
        res.render('auth', { title: '有効期限切れ'});
    } else {
        const user = await UserTmp.findOne({ "token": req.params.token });
        if (user) {
            const password = user.password;
            const email = user.email;
            const userData = {
                email: email,
                created_at: now,
                updated_at: now,
                deleted_at: null,
                notifications: []
            }
            let newUser = await User.findOne({ "email": email }); //論理削除したユーザーかどうか
            if (newUser){
                newUser.deleted_at = null;
            } else {
                newUser = new User(userData);
                newUser.display_name = '名無し';
                newUser.bio = '';
            }
            const newAuthUser = new UserAuth(userData);
            newAuthUser.password = password;
            newUser.save()
            .then(() => {
                newAuthUser.save()
                .then(async () => {
                    try {
                        await UserTmp.deleteOne(user);
                        res.render('auth', { title: '認証成功' });
                    } catch (err) {
                        console.log(err);
                    }
                });
            }); //catch消したの不安
        } else {
            res.render('auth', { title: '認証失敗'});
        }
    }
});

module.exports = router;