const express = require('express');
const router = express.Router();
const modelTmp = require('../models/tmp.js');
const modelUser = require('../models/user.js');
const modelAuth = require('../models/auth.js');
const UserTmp = modelTmp.UserTmp;
const User = modelUser.User;
const UserAuth = modelAuth.UserAuth;

router.get('/email/:token', async function(req, res, next){
    try {
        const user = await UserTmp.findOne({ token: req.params.token });

        if (!user) {
            return res.render('auth', { title: '認証失敗'});
        }

        const now = new Date();

        if (now.getTime() > user.expires){
            await UserTmp.deleteOne(user);
            return res.render('auth', { title: '有効期限切れ'});
        }

        const password = user.password;
        const email = user.email;
        const name = user.name;

        let newUser = await User.findOne({ email: email });

        if (newUser){
            newUser.deleted_at = null;
        } else {
            newUser = new User();
            newUser.display_name = name;
            newUser.email = email;
        }
        const newAuthUser = new UserAuth();
        newAuthUser.email = email;
        newAuthUser.password = password;

        await newUser.save();
        await newAuthUser.save();
        await UserTmp.deleteOne(user);

        return res.render('auth', { title: '認証成功' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;