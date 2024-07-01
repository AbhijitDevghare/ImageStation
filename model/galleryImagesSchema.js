const mongoose=require("mongoose");

const gallery=new mongoose.Schema({
    imageType:{
        type:String,
        default:"galleryImage"
    },
    imageUrl:{
        type:String,
        unique:[true,"Image already exists."],
        trim:true,
        required:[true,"Image url is required."]
    }
    
})


module.exports=mongoose.model("gallery",gallery);