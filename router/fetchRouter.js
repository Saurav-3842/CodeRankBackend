const express = require("express");
const { fetchUserData } = require("../dbController/fetchProfileController");

const fetchRouter = express.Router();

fetchRouter.post("/", fetchUserData);

module.exports = { fetchRouter };