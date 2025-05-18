const express = require("express");
const { scrapUserData, getScrapData } = require("../dbController/scrapProfileController");

const scrapRouter = express.Router();

scrapRouter.post("/", scrapUserData);
scrapRouter.get("/:userId",getScrapData);
module.exports = { scrapRouter };