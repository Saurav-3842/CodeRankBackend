const mongoose = require('mongoose');

const signUpSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        require:true,
    },
    college:{
        type: String,
    },
},
{
    timestamps: true
});

const SignUpList = mongoose.model('userLists', signUpSchema);

module.exports = { SignUpList };