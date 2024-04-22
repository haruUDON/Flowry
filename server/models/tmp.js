const mongoose = require('mongoose');

const UserTmpSchema = new mongoose.Schema({
    name  : String,
    email  : String,
    password  : String,
    token  : String,
    expires  : Date,
},{collection: 'user_tmp'});

exports.UserTmp = mongoose.model('UserTmp', UserTmpSchema);