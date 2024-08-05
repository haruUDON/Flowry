const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const UserTmp = require('../models/tmp').UserTmp;
const UserAuth = require('../models/auth').UserAuth;

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

router.post('/', async (req, res, next) => {
  try {
    if (await UserAuth.findOne({ email: req.body.email })) {
      return res.status(400).json({ message: 'このメールアドレスは既に使用されています' });
    }
    if (req.body.name.length > 50) {
      return res.status(400).json({ message: '名前は50文字以下で入力してください' });
    }
    if (!isValidEmail(req.body.email)){
      return res.status(400).json({ message: '正しいメールアドレスを入力してください' });
    }
    if (!isValidPassword(req.body.password)){
      return res.status(400).json({ message: 'パスワードは8文字以上で入力してください' });
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
      text: `Animerへご登録いただき、ありがとうございます。\n\n下記のリンクからメールアドレスの認証を行ってください。\n\n${url}\n\nリンクは送信後10分間のみ有効です。\n\n※本メールは自動送信メールとなります。\n 本メールにご返信いただきましてもスタッフは確認ができません。\n\n※このメールに心当たりがない場合はメールを破棄してください。`
    };

    await transporter.sendMail(mailData);
    res.json({ success: true, message: '認証メールを送信しました' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;