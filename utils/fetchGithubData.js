const {Octokit}  = require('octokit');
const axios = require('axios');

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || ''
});

const getGitHubData = async (url) => {
  try {
    // Extract username from URL
    const username = extractUsernameFromUrl(url);
    if (!username) {
      return {}; // Return empty object to match unified structure
    }

    // Get all data in parallel
    const [basicInfo, contributionData, reposData] = await Promise.allSettled([
      getBasicUserInfo(username),
      getContributionDataWithGraphQL(username),
      getTopRepositories(username)
    ]);

    // Normalize data structure to match unified profile format
    return {
      profile: {
        username,
        name: basicInfo.status === 'fulfilled' ? basicInfo.value.name : username,
        avatar: basicInfo.status === 'fulfilled' ? basicInfo.value.avatar : '',
        bio: basicInfo.status === 'fulfilled' ? basicInfo.value.bio : '',
        url: basicInfo.status === 'fulfilled' ? basicInfo.value.profileUrl : `https://github.com/${username}`
      },
      stats: {
        repositories: basicInfo.status === 'fulfilled' ? basicInfo.value.publicRepos : 0,
        stars: reposData.status === 'fulfilled' ? reposData.value.totalStars : 0,
        followers: basicInfo.status === 'fulfilled' ? basicInfo.value.followers : 0,
        following: basicInfo.status === 'fulfilled' ? basicInfo.value.following : 0,
        contributions: contributionData.status === 'fulfilled' ? contributionData.value.totalContributions : 0,
        streak: contributionData.status === 'fulfilled' ? contributionData.value.currentStreak : 0
      },
      contributions: contributionData.status === 'fulfilled' ? contributionData.value.weeks : [],
      repositories: reposData.status === 'fulfilled' ? reposData.value.repos : [],
      badges: [], // Will be populated by getBadges() in unified profile
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`GitHub Error for ${url}:`, error.message);
    return {}; // Return empty object to maintain unified structure
  }
};

// Helper functions
function extractUsernameFromUrl(url) {
  if (!url) return null;
  try {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)/);
    return match ? match[1] : url.split('/')[0].split('?')[0];
  } catch (e) {
    return null;
  }
}

async function getBasicUserInfo(username) {
  const { data } = await octokit.rest.users.getByUsername({ username });
  return {
    name: data.name || username,
    avatar: data.avatar_url,
    bio: data.bio || '',
    profileUrl: data.html_url,
    publicRepos: data.public_repos,
    followers: data.followers,
    following: data.following
  };
}

async function getContributionDataWithGraphQL(username) {
  const query = `
    query($username:String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                weekday
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await octokit.graphql({ query, variables: { username } });
    const calendar = response.user.contributionsCollection.contributionCalendar;
    
    // Calculate current streak
    const streak = calculateStreak(calendar.weeks);
    
    return {
      totalContributions: calendar.totalContributions,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      weeks: calendar.weeks
    };
  } catch (error) {
    console.error('GitHub GraphQL Error:', error);
    return {
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeks: []
    };
  }
}

async function getTopRepositories(username, limit = 5) {
  try {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: limit
    });

    const repos = data.map(repo => ({
      name: repo.name,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      description: repo.description || ''
    }));

    const totalStars = data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    return {
      repos,
      totalStars
    };
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return {
      repos: [],
      totalStars: 0
    };
  }
}

function calculateStreak(weeks) {
  let current = 0;
  let longest = 0;
  let temp = 0;
  const today = new Date();
  
  // Process in chronological order
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      const date = new Date(day.date);
      if (date > today) continue; // Skip future dates
      
      if (day.contributionCount > 0) {
        temp++;
        current = date.toDateString() === today.toDateString() || 
                 date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString() 
                 ? temp : current;
      } else {
        longest = Math.max(longest, temp);
        temp = 0;
      }
    }
  }
  
  longest = Math.max(longest, temp);
  return { current, longest };
}

module.exports = getGitHubData;