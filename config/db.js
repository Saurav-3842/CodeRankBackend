const mongoose = require('mongoose');
const dbUrl = process.env.NEXT_DATABASE_URL;

mongoose.connect(dbUrl,{dbName:`${process.env.NEXT_DATABASE_NAME}`})
.then(()=>{
    console.log("DB Connected");
})
.catch((err) =>{
    console.log("error occured", err);
});