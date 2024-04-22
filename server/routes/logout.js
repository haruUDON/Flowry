const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

module.exports = router;