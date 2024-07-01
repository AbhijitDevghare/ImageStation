const mongoose = require("mongoose");

const homeImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    unique: [true, "Image already exists"],
    trim: true,
    required:[true,"Image url is required"]
  },
  imageType:{
    type:String,
    default:"homeImage"
  }
});

module.exports = mongoose.model("HomeImages", homeImageSchema);
