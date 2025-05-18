function getCodeRankRating(platformData) {
    let ratings = [];
  
    if (platformData.leetcode?.problemsSolved) {
      const score = Math.min(platformData.leetcode.problemsSolved / 500, 1) * 10;
      ratings.push(score);
    }
  
    if (platformData.codeforces?.rating) {
      const score = Math.min(platformData.codeforces.rating / 2500, 1) * 10;
      ratings.push(score);
    }
  
    if (platformData.codechef?.rating) {
      const score = Math.min(Number(platformData.codechef.rating) / 2500, 1) * 10;
      ratings.push(score);
    }
  
    if (platformData.github?.github_contributions) {
      const score = Math.min(platformData.github.github_contributions / 1000, 1) * 10;
      ratings.push(score);
    }
  
    const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
    return parseFloat(average.toFixed(1));
  }
  
  function getBadges(platformData) {
    const badges = [];
  
    if (platformData.leetcode?.problemsSolved > 300) badges.push("LeetCode Master");
    if (platformData.github?.github_streak > 30) badges.push("GitHub Streaker");
    if (platformData.codeforces?.rating > 1800) badges.push("Codeforces Expert");
    if (platformData.codechef?.stars >= 4) badges.push("CodeChef 4★");
  
    return badges;
  }
  
  module.exports = { getCodeRankRating, getBadges };
  