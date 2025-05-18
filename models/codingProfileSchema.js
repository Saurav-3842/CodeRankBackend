const mongoose = require('mongoose');

const codingProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userLists', // Reference the user model
    required: true,
  },
  github: Object,
  leetcode: Object,
  codechef: Object,
  codeforces: Object,
  hackerrank: Object,
});

module.exports = mongoose.model('ScrapCodingProfile', codingProfileSchema);
