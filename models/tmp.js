const mongoose = require('mongoose');

const UserTmpSchema = new mongoose.Schema({
    email  : String,
    password  : String,
    token  : String
},{collection: 'user_tmp'});

exports.UserTmp = mongoose.model('UserTmp', UserTmpSchema);