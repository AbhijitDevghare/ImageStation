require("dotenv").config();
const app=require("./app.js")

const PORT= process.env.PORT;

app.listen(PORT,(req,resp)=>{
    console.log(`The server is running on the port ${PORT}`)
})  