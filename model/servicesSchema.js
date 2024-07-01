const mongoose = require("mongoose");

const services = new  mongoose.Schema({
        serviceName : {
            type:String,
            required:[true,"Service Name is required"],
            unique: [true, "Service already exists"]
        },
        thumbnailImageUrl:{
            type:String,
            required:[true,"Image url is required"] 
        },
        description:{
            type:String,
            required:[true,"Image description is required."],
        },
        startingPrice : {
            type:String,
            required:[true,"Price is required"]
        },
        duration:{
            type:String
        },
        inclusions:{
            type:String
        },
        mediaType:{
            type:String,
            default:"Service"   
        }
        
})

module.exports = mongoose.model("services",services);