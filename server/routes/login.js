const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user').User;
const UserAuth = require('../models/auth').UserAuth;

router.post('/', async (req, res) => {
try {
    const { email, password } = req.body;

    const userAuth = await UserAuth.findOne({ email });

    if (!userAuth) {
        return res.status(401).json({ message: '該当するアカウントが見つかりませんでした' });
    }

    const isMatch = await bcrypt.compare(password, userAuth.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'パスワードが間違っています' });
    }
    
    const user = await User.findOne({ email });

    req.session.user = user._id;
    res.json({ success: true, message: 'ログインに成功しました' });
} catch (err) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
}
});

module.exports = router;