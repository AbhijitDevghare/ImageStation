require("dotenv").config();
const mongoose=require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const crypto=require("crypto");

const User=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name of the user is required"],
        trim:true,
        maxLength:[50,"Name must be less  than 50 characters"],
        minLength:[5,"Name must be greater than 5 characters"]
    },
    username:{
        type:String,
        required:[true,"username is required"],
        unique:[true,"username is not available"],
        maxLength:[20,"username should not exceed  20 characters"],
        trim:true
    },

    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Already registered"],
        lowercase:true,
        trim:true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true
      },
    password:{
        type:String,
        required:[true,"password is required"],
        minLength:[5,"The password must be greater than 5 characters"],
        select:false
    },
    role:{
        type:String,
        default:"user"
    },
    

}, {
    timestamps : true
})






// Middleware to hash the password before saving
User.pre('save', async function (next){
  if (!this.isModified('password')) {
    // If the password field is not modified, move to the next middleware
    return next();
  }

    this.password  = await bcrypt.hash(this.password, 10);
    return next();

});



User.methods = {
    jwtToken() {
        return JWT.sign(
            { id: this._id, email: this.email },
            process.env.SECRET,
            { expiresIn: '24h' }
        );
    }
};




module.exports=mongoose.model("user",User);