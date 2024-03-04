const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
const modelTmp = require('../models/tmp.js');
const modelAuth = require('../models/auth.js');
const UserTmp = modelTmp.UserTmp;
const UserAuth = modelAuth.UserAuth;

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
});

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    return password.length >= 8;
}

router.get('/', (req, res) => {
    if(req.session.user){
        res.redirect('/');
    } else {
        res.render('signup', { errors: [], title: 'サインアップ' });
    }
});

router.post('/', async (req, res, next) => {
    try {
        const errors = [];

        if (await UserAuth.findOne({ email: req.body.email })){
            errors.push('このメールアドレスは既に使用されています。');
        }
        if (req.body.name.length > 50) {
            console.log(req.body.name.length);
            errors.push('名前は50文字以下で入力してください。');
        }
        if (!isValidPassword(req.body.password)){
            errors.push('パスワードは8文字以上で入力してください。');
        }
        if (!isValidEmail(req.body.email)){
            errors.push('正しいメールアドレスを入力してください。');
        }
        if (errors.length > 0) {
            console.log(errors);
            res.render('signup', { errors, title: 'サインアップ' });
            return;
        }

        const newUser = new UserTmp(req.body);
        let token = crypto.randomBytes(16).toString('hex');
        let password = await bcrypt.hash(newUser.password, 10);
        const email = newUser.email;
        const now = new Date;
        const expires = new Date(now.getTime() + 10 * 60000);
        let url = `http://163.44.102.111/auth/email/${token}`;
        newUser.password = password;
        newUser.token = token;
        newUser.expires = expires;

        newUser.save();

        const mailData = {
            from: "flowry.info@gmail.com",
            to: email,
            subject: `メールアドレスの確認`,
            text: `Flowryへご登録いただき、ありがとうございます。\n\n下記のリンクからメールアドレスの認証を行ってください。\n\n${url}\n\nリンクは送信後10分間のみ有効です。\n\n※本メールは自動送信メールとなります。\n 本メールにご返信いただきましてもスタッフは確認ができません。\n\n※このメールに心当たりがない場合はメールを破棄してください。`
        };

        await transporter.sendMail(mailData);
        res.render('signup', { errors: [] ,title: 'アカウントの確認' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;