const express = require("express");
const jwtAuth = require("../middleware/jwtAuth.js");
const router = express.Router();
const upload = require('../middleware/multer.js');
const {home,register,login,logout,getuser, uploadHomeImages,uploadGalleryImages,uploadAlbumImages,getGalleryVideos,uploadGalleryMedia,addService,getHomeImages,getGalleryImages,getGalleryAlbums,getServices,deleteMedia} = require("../userControllers/controllers.js");
  
router.get("/",home)
router.post("/register", register);
router.post("/login",login);
router.get("/logout",logout);

router.get("/getuser",jwtAuth,getuser)

router.post("/uploadHomeImages",jwtAuth,upload.single('file'), uploadHomeImages);
router.post("/uploadGalleryImages", jwtAuth,upload.single('file'), uploadGalleryImages);
router.post("/uploadAlbumImages", jwtAuth,upload.single('file'), uploadAlbumImages);
router.post("/uploadGalleryMedia", jwtAuth,upload.single('file'), uploadGalleryMedia);

router.delete("/deleteMedia/:mediaType/:id",jwtAuth,deleteMedia)

router.post('/addService',jwtAuth,upload.single('thumbnail'),addService)
router.get("/getHomeImages",getHomeImages);
router.get("/getGalleryImages",getGalleryImages)
router.get('/getGalleryAlbums',getGalleryAlbums);
router.get('/getGalleryVideos',getGalleryVideos);
router.get('/getServices',getServices)


module.exports = router;
