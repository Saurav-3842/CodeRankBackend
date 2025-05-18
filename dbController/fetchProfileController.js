const express = require('express');

const CodingProfile = require('../models/codingProfile');
const { fetchUserFromUrl } = require('../utils/fetchUserData');

const fetchUserData = async (req, res) => {
  const { github, leetcode, codechef, codeforces, hackerrank } = req.body;

  const urls = { github, leetcode, codechef, codeforces, hackerrank };
  const result = {};

  try {
    await Promise.all(
      Object.entries(urls).map(async ([platform, link]) => {
        if (link) {
          try {
            const data = await fetchUserFromUrl(link);
            result[platform] = data;
          } catch (err) {
            result[platform] = { error: err.message };
          }
        }
      })
    );

    const savedProfile = new CodingProfile(result);
    await savedProfile.save();

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {fetchUserData};
