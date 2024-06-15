const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema({
    id: Number,
    title: String,
    title_kana: String,
    released_on: String,
    season_name: String,
    episodes_count: Number,
    no_episodes: Boolean,
    watchers_count: Number
},{collection: 'anime'});

exports.Anime = mongoose.model('Anime', AnimeSchema);