import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ API Secret is valid!", result);
  } catch (error) {
    console.error("❌ API Secret mismatch:", error.message);
  }
})();

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const res = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
        // file has been uploaded successfully
        fs.unlinkSync(localFilePath);
        return res;
    } catch (err) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export const deleteImgOnCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return null;
        const publicId = imageUrl.split('/').pop().split('.')[0];  // Extract public ID
        const result = await cloudinary.uploader.destroy(publicId, {resource_type: "image"});;
        return result;
    } catch (error) {
        throw error;
    }
};

export const deleteVideoOnCloudinary = async (videoUrl) => {
    try {
        if (!videoUrl) return null;
        const publicId = videoUrl.split('/').pop().split('.')[0];  // Extract public ID
        const result = await cloudinary.uploader.destroy(publicId, {resource_type: "video"});;
        return result;
    } catch (error) {
        throw error;
    }
};