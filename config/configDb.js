require("dotenv").config();
const mongoose=require("mongoose");

const MONGO_URL=process.env.MONGO_URL ;
const connectToDb=async ()=>{
    mongoose.connect(MONGO_URL)
    .then((conn)=>{
        console.log(`Connected to the Database ${conn.connection.host}`);
    })
    .catch((err)=>{
        console.log(err.message);
        process.exit(1);
    })
    
}

module.exports=connectToDb;