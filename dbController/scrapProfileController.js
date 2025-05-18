const express = require('express');
const fetchUnifiedProfile = require("../utils/fetchUnifiedProfile");
const codingProfileSchema = require('../models/codingProfileSchema');
const getScrapData = async (req,res) => {
  try{
    const { userId } = req.params; // Extract path parameter
    const data = await codingProfileSchema.find({ user: userId });
    
    res.json({
      status: "success",
      data: data,
    });

  } catch (err){
    console.log("Error Fetching Data", err);
  }
};

const scrapUserData = async (req, res) => {
    try {
        const { github, leetcode, codeforces, email} = req.body;
        const result = await fetchUnifiedProfile({ github, leetcode, codeforces, email });
        res.status(200).json(result);
      } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Something went wrong." });
      }
};


module.exports = {scrapUserData,getScrapData};
