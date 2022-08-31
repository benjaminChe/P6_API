const mongoose = require('mongoose');

const modelUser = mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  });

module.exports = mongoose.model('Thing', modelUser);