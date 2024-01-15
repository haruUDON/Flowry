const express = require('express');
const router = express.Router();
const modelAuth = require('../models/auth.js');
const modelUser = require('../models/user.js');
const UserAuth = modelAuth.UserAuth; 
const User = modelUser.User;

const loginCheck = (req, res, next) => {
    if(req.session.user){
        next();
    } else {
        res.redirect('/login');
    }
};

router.get('/', loginCheck, (req, res) => {
    res.render('delete-account');
});

router.post('/', loginCheck, async (req, res, next) => {
    try {
        const email = req.session.user;
        const user = await User.findOne({ email: email });
        const now = new Date();
        user.deleted_at = now;
        await user.save();
        await UserAuth.findOneAndRemove({ email: email }); //Authの情報は物理削除
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        next(err);
    }
});

module.exports = router;