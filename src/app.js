require("dotenv").config();
require('../config/db.js');
require('../config/nodemailer.js');
const cookieParser = require("cookie-parser");
const express = require('express');
const cors = require('cors');
const { OtpRouter } = require('../router/otpRouter.js');
const {fetchRouter} = require('../router/fetchRouter.js')
const {scrapRouter} = require('../router/scrapRouter.js');
const { AuthRouter } = require("../router/authRouter.js");
// const { verifyToken } = require("../middleware/jwtVerification.js");
const authenticateUser = require("../middleware/authMiddleware.js");

const PORT = process.env.PORT || 2202;
const app = express();

// req body parse and attach to req
app.use(express.json()); 
// req cookies will be parsed
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
    // allowedHeaders: ['Content-Type', 'Authorization'], 
}));

app.use("/otp", OtpRouter);
app.use('/fetch-profiles', fetchRouter);
app.use('/auth',AuthRouter);
// app.use(verifyToken);
app.get('/isAuthenticated', authenticateUser, async (req, res) => {
    try {
      // If middleware passes, user is authenticated
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            _id: req.user._id,
            email: req.user.email,
            fullname: req.user.fullname,
            college: req.user.college,
            // Add other fields you want to expose
          }
        }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });
app.use('/scrap-fetch',scrapRouter);

app.listen(PORT, () => {
    console.log(`-------------- Server Started on Port ${PORT} --------------`);
});
