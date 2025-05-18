const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

async function fetchGitHub(username) {
  const { data } = await axios.get(`https://api.github.com/users/${username}`);
  return {
    platform: 'GitHub',
    username,
    name: data.name,
    bio: data.bio,
    followers: data.followers,
    public_repos: data.public_repos,
  };
}

async function fetchLeetCode(username) {
  const res = await axios.post('https://leetcode.com/graphql', {
    query: `query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile { reputation ranking }
      }
    }`,
    variables: { username },
  });

  const user = res.data.data.matchedUser;
  return {
    platform: 'LeetCode',
    username: user?.username,
    reputation: user?.profile?.reputation,
    ranking: user?.profile?.ranking,
  };
}

async function fetchCodeforces(username) {
  const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
  const user = data.result[0];
  return {
    platform: 'Codeforces',
    username: user.handle,
    rating: user.rating,
    rank: user.rank,
    maxRank: user.maxRank,
  };
}

async function fetchCodechef(username) {
  const { data } = await axios.get(`https://www.codechef.com/users/${username}`);
  const $ = cheerio.load(data);
  const rating = $('div.rating-number').first().text();
  return {
    platform: 'CodeChef',
    username,
    rating,
  };
}

async function fetchHackerRank(username) {
  const { data } = await axios.get(`https://www.hackerrank.com/${username}`);
  const $ = cheerio.load(data);
  const name = $('meta[property="og:title"]').attr('content');
  return {
    platform: 'HackerRank',
    username,
    name,
  };
}

async function fetchUserFromUrl(profileUrl) {
  const parsed = url.parse(profileUrl);
  const hostname = parsed.hostname;
  const path = parsed.pathname;

  if (hostname.includes('github.com')) return fetchGitHub(path.split('/')[1]);
  if (hostname.includes('leetcode.com')) return fetchLeetCode(path.split('/')[1]);
  if (hostname.includes('codeforces.com')) return fetchCodeforces(path.split('/')[2]);
  if (hostname.includes('codechef.com')) return fetchCodechef(path.split('/')[2]);
  if (hostname.includes('hackerrank.com')) return fetchHackerRank(path.split('/')[1]);

  throw new Error('Unsupported platform.');
}

module.exports = { fetchUserFromUrl };
