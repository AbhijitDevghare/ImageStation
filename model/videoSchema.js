const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  videoUrl: {
    type: String,
    required: true,
    trim: true,
  },
  videoType:{
    type:String,
    default:"videoGallery"
  }
});

module.exports = mongoose.model('Video', videoSchema);
