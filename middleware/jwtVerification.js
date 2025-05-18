const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const { cookies } = req;
    const { token } = cookies || {};
    if (!token) {
        res.status(401).json({
            status: "fail",
            message: "Please login",
        });
    } else {
        jwt.verify(token, process.env.jwt_secret_key, async (err, userInfo) => {
            if (err) {
                res.status(401).json({
                    status: "fail",
                    message: "Please login. Invalid token!",
                });
                return;
            }
            req.userInfo = userInfo;
            next();
        });
    }
};

module.exports = { verifyToken };