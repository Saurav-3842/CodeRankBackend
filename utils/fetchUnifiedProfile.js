const axios = require("axios");
const cheerio = require("cheerio");
const CodingProfileSchema = require("../models/codingProfileSchema");
const getGitHubData = require("./services/fetchGithubData");
const getLeetCodeData = require("./services/fetchLeetcodeData");
const getCodeforcesData = require("./services/fetchCodeforces");
const { SignUpList } = require("../models/signUpSchema");

// const getCodechefData = async (url) => {
//   const codechefusername = url.split("/users/")[1];
//   const res = await axios.get(`https://www.codechef.com/users/${codechefusername}`);
//   const $ = cheerio.load(res.data);
//   const rating = $(".rating-number").first().text();
//   const stars = $(".rating-star").text().trim().length;
//   return {
//     rating,
//     stars,
//   };
// };

// const puppeteer = require("puppeteer");

// const getHackerRankData = async (url) => {
//   const browser = await puppeteer.launch({ headless: "new" });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: "networkidle2" });

//   // Get name
//   const name = await page.$eval("h1", el => el.textContent.trim()).catch(() => null);

//   // Get badges (image alt text)
//   const badges = await page.$$eval(".hacker-badge img", imgs =>
//     imgs.map(img => img.alt || img.getAttribute("aria-label") || "Badge")
//   );

//   // Get skills (top tags)
//   const skills = await page.$$eval(".skill-name", skills =>
//     skills.map(skill => skill.textContent.trim())
//   );

//   // Get problems solved (from dashboard stats card)
//   const problemsSolved = await page.$$eval(".score-card .score-title", titles => {
//     const problemStat = titles.find(el => el.textContent.includes("Problem Solving"));
//     return problemStat ? parseInt(problemStat.nextElementSibling.textContent.trim()) : 0;
//   });

//   // Get overall scores (from dashboard)
//   const scores = await page.$$eval(".score-card", cards =>
//     cards.map(card => {
//       const title = card.querySelector(".score-title")?.textContent.trim();
//       const score = card.querySelector(".score-value")?.textContent.trim();
//       return title && score ? { title, score } : null;
//     }).filter(Boolean)
//   );

//   await browser.close();

//   return {
//     name: name || "Unknown",
//     badges,
//     skills,
//     problemsSolved,
//     scores,
//   };
// };

const fetchUnifiedProfile = async ({ github, leetcode, codeforces ,email}) => {
  const [gh, lc, cf] = await Promise.allSettled([
    github ? getGitHubData(github) : null,
    leetcode ? getLeetCodeData(leetcode) : null,
    codeforces ? getCodeforcesData(codeforces) : null,
  ]);

  const user = await SignUpList.findOne({ email: email });
  if (!user) throw new Error("User not found");

  const unified = {
    github: gh.status === "fulfilled" ? gh.value : {},
    leetcode: lc.status === "fulfilled" ? lc.value : {},
    codeforces: cf.status === "fulfilled" ? cf.value : {},
    user: user._id,
  };

  const codingProfileSchema = new CodingProfileSchema(unified);

  await codingProfileSchema.save();

  return codingProfileSchema;
};

module.exports = fetchUnifiedProfile;
