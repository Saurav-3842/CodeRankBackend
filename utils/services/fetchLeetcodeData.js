const axios = require('axios');
const getLeetCodeData = async (url) => {
    try {
      const username = url.includes("/u/")
        ? url.split("/u/")[1].replace(/\/$/, "")
        : url.split("leetcode.com/")[1].replace(/\/$/, "");
  
      const response = await axios.post("https://leetcode.com/graphql", {
        query: `
          {
            matchedUser(username: "${username}") {
              profile {
                realName
                userAvatar
                reputation
                ranking
              }
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
              badges {
                displayName
                icon
              }
              languageProblemCount {
                languageName
                problemsSolved
              }
              tagProblemCounts {
                advanced {
                  tagName
                  tagSlug
                  problemsSolved
                }
                intermediate {
                  tagName
                  tagSlug
                  problemsSolved
                }
                fundamental {
                  tagName
                  tagSlug
                  problemsSolved
                }
              }
            }
          }
        `,
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const user = response.data.data.matchedUser;
  
      const profile = user.profile;
      const stats = user.submitStatsGlobal.acSubmissionNum;
      const badges = user.badges;
      const languageProblemCount = user.languageProblemCount;
      const tagProblemCounts = user.tagProblemCounts;
      const totalSolved = stats.find((s) => s.difficulty === "All")?.count || 0;
      const totalSubmissions = stats.find((s) => s.difficulty === "All")?.submissions || 0;

      const acceptanceRate =
        totalSubmissions > 0 ? ((totalSolved / totalSubmissions) * 100).toFixed(2) : "0.00";
  
  
      return {
        name: profile.realName,
        avatar: profile.userAvatar,
        reputation: profile.reputation,
        rank: profile.ranking,
        problemsSolved: totalSolved,
        acceptanceRate: acceptanceRate,
        badges: badges.map((b) => ({
          name: b.displayName,
          icon: `https://leetcode.com${b.icon}`,
        })),
        languageStats: languageProblemCount.map((lang) => ({
          language: lang.languageName,
          problemsSolved: lang.problemsSolved,
        })),
        tagStats: {
          advanced: tagProblemCounts.advanced.map((tag) => ({
            name: tag.tagName,
            problemsSolved: tag.problemsSolved,
          })),
          intermediate: tagProblemCounts.intermediate.map((tag) => ({
            name: tag.tagName,
            problemsSolved: tag.problemsSolved,
          })),
          fundamental: tagProblemCounts.fundamental.map((tag) => ({
            name: tag.tagName,
            problemsSolved: tag.problemsSolved,
          })),
        },
      };
    } catch (error) {
      console.error("Error fetching LeetCode data:", error);
      return {}; // Return empty object in case of error
    }
  };


module.exports = getLeetCodeData;