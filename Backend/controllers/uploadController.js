import cloudinary from "cloudinary";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (req, res) => {
  try {
    const file = req.files?.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Upload file to Cloudinary
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "UrbanTales",
      resource_type: "auto",
    });

    fs.unlinkSync(file.tempFilePath); // remove temp file
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
