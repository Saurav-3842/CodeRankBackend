const axios = require('axios');

const getLeetCodeData = async (url) => {
  try {
    const username = url.includes("/u/")
      ? url.split("/u/")[1].replace(/\/$/, "")
      : url.split("leetcode.com/")[1].replace(/\/$/, "");

    const response = await axios.post("https://leetcode.com/graphql", {
      query: `
        query combined($username: String!) {
          user: matchedUser(username: $username) {
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
          contest: userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
          }
          contestHistory: userContestRankingHistory(username: $username) {
            attended
            trendDirection
            problemsSolved
            totalProblems
            finishTimeInSeconds
            rating
            ranking
            contest {
              title
              startTime
            }
          }
        }
      `,
      variables: { username },
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data.data;
    const user = data.user;
    const contest = data.contest;
    const contestHistory = data.contestHistory;

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
      acceptanceRate,
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
      contestStats: contest
        ? {
            attendedContests: contest.attendedContestsCount,
            rating: contest.rating,
            globalRanking: contest.globalRanking,
            totalParticipants: contest.totalParticipants,
            topPercentage: contest.topPercentage?.toFixed(2),
          }
        : null,
      contestHistory: contestHistory.map((entry) => ({
        contestTitle: entry.contest.title,
        startTime: entry.contest.startTime,
        attended: entry.attended,
        trendDirection: entry.trendDirection,
        problemsSolved: entry.problemsSolved,
        totalProblems: entry.totalProblems,
        finishTimeInSeconds: entry.finishTimeInSeconds,
        rating: entry.rating,
        ranking: entry.ranking,
      })),
    };
  } catch (error) {
    console.error("Error fetching LeetCode data:", error.response?.data || error.message);
    return {};
  }
};

module.exports = getLeetCodeData;
