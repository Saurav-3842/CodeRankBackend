const axios = require('axios');
const getCodeforcesData = async (url) => {
    const handle = url.split("profile/")[1];
    const res = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    const user = res.data.result[0];
    return {
      handle: user.handle,
      rank: user.rank || null,
      rating: user.rating || null,
      maxRating: user.maxRating || null,
    };
  };

  module.exports = getCodeforcesData;