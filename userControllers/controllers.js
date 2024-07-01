require("dotenv").config();
const { uploadOnCloudinary } = require('../middleware/cloudinary.js');
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const homeImages = require('../model/homeImagesSchema.js');
const albumImages = require('../model/albumImagesSchema.js');
const gallery = require('../model/galleryImagesSchema.js');
const Video = require('../model/videoSchema.js');
const User = require('../model/userSchema.js');
const Service = require('../model/servicesSchema.js');
const fs = require("fs");
const cloudinary = require('cloudinary'). v2;


// Home
const home = async (req, resp) => {
  return resp.status(200).json({
    message: "WELCOME TO HOME PAGE"
  });
};

// Register
const register = async (req, resp, next) => {
  console.log("REQUEST");

  try {
    const { name, username, email, phoneNumber, password, confirmPassword } = req.body;

    if (!name || !username || !email || !phoneNumber || !password || !confirmPassword) {
      return resp.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate email
    const validateEmail = await emailValidator.validate(email);
    if (!validateEmail) {
      throw new Error("Not a valid email");
    }

    // Check password is equal to confirm password
    if (password != confirmPassword) {
      throw new Error("Password must be same");
    }

    // Save The Data 
    const userInstance = await User(req.body);
    await userInstance.save();

    resp.status(200).json({
      success: true,
      message: "User Created Successfully"
    });
  } catch (error) {
    if (error.code === 11000) {
      return resp.json({
        message: "User already exists"
      });
    }
    return resp.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Login

const login = async (req, resp, next) => {
  console.log("LOGIN REQUEST");
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return resp.status(400).json({
        success: false,
        message: "Identifier (username, email, or phone number) and password are required"
      });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier }
      ]
    }).select('+password');

    if (!user) {
      return resp.status(404).json({
        success: false,
        message: "User doesn't exist"
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (checkPassword) {
      const token = await user.jwtToken();
      user.password = undefined;

      const cookieOptions = {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'None' // Required for cross-origin requests
      };

      resp.cookie("token", token, cookieOptions);
      return resp.status(200).json({
        success: true,
        message: "Login Successful",
        user: user
      });
    } else {
      return resp.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: error.message
    });
  }
};






// For user logout
const logout = async (req, resp, next) => {
  console.log("REQUEST FOR LOGOUT");
  try {
    const cookieOption = {
      expires: new Date(),
      httpOnly: true
    };

    resp.cookie("token", null, cookieOption);
    resp.status(200).json({
      success: true,
      message: "Logged Out"
    });
  } catch (error) {
    resp.status(400).json({
      success: true,
      message: error.message
    });
  }
};


// Get user Controller
const getuser = async (req, resp) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    user.password = undefined;

    return resp.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return resp.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Upload Home Images
const uploadHomeImages = async (req, res) => {
  console.log("UPLOADING THE HOME IMAGES");
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!(user.role == "admin")) {
    return res.status(400).json({
      success: false,
      message: "Not authorized"
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const localFilePath = req.file.path;
    const folderName = "HomeImages"; // Replace with your desired folder name

    const response = await uploadOnCloudinary(localFilePath, folderName);
    if (response) {
      const url = response.url;
      // Create a new image instance with the URL returned from Cloudinary
      // console.log(url);
      const newImage = new homeImages({
        imageUrl: url
      });

      // Save the image to the database
      await newImage.save();

      res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        url: url
      });
    } else {
      res.status(500).send("Failed to upload file to Cloudinary.");
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};  

// Upload Album Images
const uploadAlbumImages = async (req, res) => {
  console.log("UPLOADING THE ALBUM IMAGES");
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!(user.role == "admin")) {
    return res.status(400).json({
      success: false,
      message: "Not authorized"
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const localFilePath = req.file.path;
    const folderName = "AlbumImages"; // Replace with your desired folder name

    const response = await uploadOnCloudinary(localFilePath, folderName);
    if (response) {
      const url = response.url;
      // Create a new image instance with the URL returned from Cloudinary
      console.log(url);
      const newImage = new albumImages({
        imageUrl: url
      });

      // Save the image to the database
      await newImage.save();

      res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        url: url
      });
    } else {
      res.status(500).send("Failed to upload file to Cloudinary.");
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};

// Upload Gallery Images
const uploadGalleryImages = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!(user.role == "admin")) {
    return res.status(400).json({
      success: false,
      message: "Not authenticated"
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const localFilePath = req.file.path;
    const folderName = "galleryImages"; // Replace with your desired folder name

    const response = await uploadOnCloudinary(localFilePath, folderName);
    const url = response.url;
    if (response) {
      // Create a new image instance with the URL returned from Cloudinary
      // console.log(response.url);
      const newImage = new gallery({
        imageUrl: url
      });

      // Save the image to the database
      await newImage.save();

      res.status(200).json({
        success: true,
        message: "File uploaded successfully.",
        url: response.url
      });
    } else {
      res.status(500).send("Failed to upload file to Cloudinary.");
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};


// For uploading Gallery Media

const uploadGalleryMedia = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!(user.role === "admin")) {
    return res.status(400).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    // Check if the uploaded file is a video
    // if (!req.file.mimetype.startsWith("video/")) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Only video files are allowed.",
    //   });
    // }

    const localFilePath = req.file.path;
    const folderName = "galleryMedia"; // Adjust as needed

    const response = await uploadOnCloudinary(localFilePath, folderName);
    if (response) {
      const url = response.url;
      // console.log("MEDIA URL:", url);

      // Create a new Video instance since only videos are allowed
      const newVideo = new Video({ videoUrl: url });

      // Save the video to the database
      await newVideo.save();

      res.status(200).json({
        success: true,
        message: "Video uploaded successfully.",
        url: response.url,
      });
    } else {
      res.status(500).send("Failed to upload file to Cloudinary.");
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};


// Add Service
const addService = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!(user.role == "admin")) {
    return res.status(400).json({
      success: false,
      message: "Not authenticated"
    });
  }

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded ...Try Again.",
      });
    }

    const localFilePath = req.file.path;
    const folderName = "serviceThumbnail"; // Replace with your desired folder name

    const { serviceName, description, startingPrice, duration, inclusions } = req.body;

    if (!serviceName || !description || !startingPrice) {
      return res.status(400).json({
        success: false,
        message: "Service name, description, and starting price are required"
      });
    }

    const response = await uploadOnCloudinary(localFilePath, folderName);
    const url = response.url;

    if (response) {
      // Create a new image instance with the URL returned from Cloudinary
      const serviceInstance = new Service({
        serviceName,
        thumbnailImageUrl: url,
        description,
        startingPrice,
        duration,
        inclusions
      });

      await serviceInstance.save();

      return res.status(200).json({
        success: true,
        message: "Successfully added the service."
      });
    } else {
      res.status(500).send("Failed to upload file to Cloudinary.");
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// For getting home images

const getHomeImages = async (req, res) => {
  try {
    const homeImagesResp = await homeImages.find().sort({ _id: -1 });
    res.status(200).json({
      success: true,
      message: homeImagesResp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// For getting gallery Images
const getGalleryImages = async (req, res) => {
  try {
    const galleryImagesResp = await gallery.find().sort({ _id: -1 });
    // console.log(galleryImagesResp);
    res.status(200).json({
      success: true,
      message: galleryImagesResp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// For getting gallery albums

const getGalleryAlbums = async (req, res) => {
  try {
    const galleryAlbumImagesResp = await albumImages.find().sort({ _id: -1 });
    console.log(galleryAlbumImagesResp);
    res.status(200).json({
      success: true,
      message: galleryAlbumImagesResp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// For getting gallery Videos

const getGalleryVideos = async(req,res)=>{
  try {
    const galleryVideoResp = await Video.find().sort({ _id: -1 });
    console.log(galleryVideoResp);
    res.status(200).json({
      success: true,
      message: galleryVideoResp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


// For getting the services 

const getServices = async(req,res)=>{
  try {
    const serviceResp = await Service.find().sort({ _id: -1 });
    console.log(serviceResp);
    res.status(200).json({
      success: true,
      message: serviceResp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } 
}




//For Deleting all types of media


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const deleteMedia = async (req, res) => {
  try {
    // Authenticate user
    const userId = await req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete the image",
      });
    }

    const mediaId = await req.params.id;
    const mediaType = await req.params.mediaType;
    console.log(mediaId)
    console.log(mediaType)

    let deletedMedia;

    if(mediaType=="homeImage")
         deletedMedia = await homeImages.findByIdAndDelete(mediaId);
    
    if(mediaType=="galleryImage")
      deletedMedia = await gallery.findByIdAndDelete(mediaId)

    if(mediaType=="albumImage")
      deletedMedia = await albumImages.findByIdAndDelete(mediaId)

    if(mediaType=="videoGallery")
        deletedMedia = await Video.findByIdAndDelete(mediaId)
    
    if(mediaType=="Service  ")
      deletedMedia = await Service.findByIdAndDelete(mediaId)

    console.log(deleteMedia)

    if(!deletedMedia){
        return res.status(400).json({
          success:false,
          message:"Sorry the media is not deleted . Please try again"
        })
    }

    // Get URL from request body
    const { url } = await req.body; 

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "No URL provided.",
      });
    }



    // Extract public_id from URL
    const extractPublicId = (url) => {
      const regex = /\/v[0-9]+\/([^/.]+)\/([^/.]+)\.[a-z]+$/;
      const match = url.match(regex);
      return match ? `${match[1]}/${match[2]}` : null;
    };

    const publicId = await extractPublicId(url);

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format, could not extract public_id",
      });
    }

    console.log(publicId)

    // Delete image from Cloudinary
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while deleting the image from Cloudinary",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Successfully deleted the image from the Database and Cloudinary",
        cloudinaryResult: result
      });
    });

  } catch (error) {
    console.error("Error deleting media:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the media",
    });
  }
};


  
  

module.exports = {
  home,
  register,
  login,
  logout,
  getuser,
  uploadHomeImages,
  uploadAlbumImages,
  uploadGalleryImages,
  uploadGalleryMedia,
  addService,
  getHomeImages,
  getGalleryImages,
  getGalleryAlbums,
  getGalleryVideos,
  getServices,
  deleteMedia
};
