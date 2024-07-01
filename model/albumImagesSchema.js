const mongoose = require("mongoose");

const albumImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    unique: [true, "Image already exists"],
    trim: true,
    required:[true,"Image url is required"]
  },
  imageType:{
    type:String,
    default:"albumImage"
  }
});

module.exports = mongoose.model("AlbumImages", albumImageSchema);
