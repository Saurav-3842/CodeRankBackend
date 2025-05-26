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

const authenticateUser = require("../middleware/authMiddleware.js");

const PORT = process.env.PORT || 2202;
const app = express();

app.use(express.json()); 

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    
}));

app.use("/otp", OtpRouter);
app.use('/fetch-profiles', fetchRouter);
app.use('/auth',AuthRouter);

app.get('/isAuthenticated', authenticateUser, async (req, res) => {
    try {
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            _id: req.user._id,
            email: req.user.email,
            fullname: req.user.fullname,
            college: req.user.college,
            
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
