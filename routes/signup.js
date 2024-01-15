const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
const modelTmp = require('../models/tmp.js');
const modelAuth = require('../models/auth.js');
const UserTmp = modelTmp.UserTmp;
const UserAuth = modelAuth.UserAuth;

// メール送信設定
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
    res.render('signup', { errors: [], title: 'サインアップ' });
});

router.post('/', async (req, res) => {
    const errors = [];
    if (await UserAuth.findOne({ email: req.body.email })){
        errors.push('このメールアドレスは既に使用されています。');
    }
    if (!req.body.name.length <= 50) {
        errors.push('名前は50文字以下で入力してください。');
    }
    if (!isValidPassword(req.body.password)){
        errors.push('パスワードは8文字以上で入力してください。');
    }
    if (!isValidEmail(req.body.email)){
        errors.push('正しいメールアドレスを入力してください。');
    }
    if (errors.length > 0) {
        res.render('signup', { errors, title: 'サインアップ' });
        return;
    }
    const newUser = new UserTmp(req.body);
    let token = crypto.randomBytes(16).toString('hex');
    let password = await bcrypt.hash(newUser.password, 10);
    const email = newUser.email;
    const now = new Date;
    const expiration = now.setHours(now.getHours() + 1);
    let url = 'localhost:3000/auth/email/' + token + '?expires=' + expiration;
    newUser.password = password;
    newUser.token = token;
    newUser.save()
        .then(() => {
            const mailData = {
                from: "haruzpasta@gmail.com",
                to: email,
                subject: `メールアドレスの確認`,
                text: "以下のリンクからアカウントの確認を行ってください｡\n\n" + url
            };
            transporter.sendMail(mailData, (err, info) => {
                if (err) {
                    console.log(err); 
                } else {
                    console.log(info);
                    res.render('signup', { errors: [] ,title: 'アカウントの確認' });
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;