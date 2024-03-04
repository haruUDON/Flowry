const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const modelAuth = require('../models/auth');
const UserAuth = modelAuth.UserAuth;

router.get('/', function(req, res) {
    if(req.session.user){
        res.redirect('/');
    } else {
        res.render('login', { errors: [] });
    }
});

router.post('/', async function(req, res) {
    const errors = [];
    const email = req.body.email;
    const password = req.body.password;
    try {
        const userAuth = await UserAuth.findOne({ email: email });
        if (userAuth) {
            const isMatch = await bcrypt.compare(password, userAuth.password);
            if (isMatch) {
                req.session.user = email;
                res.redirect('/');
            } else {
                errors.push('パスワードが間違っています。もう一度入力してください。');
            }
        } else {
            errors.push('該当するアカウントが見つかりませんでした。');
        }
        if (errors.length > 0) {
            res.render('login', { errors });
            return;
        }
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;