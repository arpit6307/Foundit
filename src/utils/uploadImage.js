// src/utils/uploadImage.js

/**
 * Cloudinary par image upload karne ke liye optimized function.
 * @param {File} file - Jo image user ne select ki hai.
 * @returns {Promise<string|null>} - Image ka secure URL ya error hone par null.
 */
export const uploadImageToCloudinary = async (file) => {
  // Agar file exist nahi karti toh turant null return karein (undefined error se bachne ke liye)
  if (!file) {
    console.error("No file provided for upload");
    return null;
  }

  const cloudName = "dhsyajcf3"; // Aapka real Cloud Name
  const uploadPreset = "Foundit"; // Aapka real Preset Name

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    // Dynamic URL ka use karein taaki "YOUR_CLOUD_NAME" wala error na aaye
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    // Agar response ok nahi hai (e.g., 401, 404), toh error throw karein
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();

    // Success hone par secure_url return karein
    if (data && data.secure_url) {
      console.log("Image uploaded successfully:", data.secure_url);
      return data.secure_url;
    }

    return null;
  } catch (error) {
    // Console mein error detail mein dikhayega
    console.error("Cloudinary Upload Error Details:", error.message);
    return null;
  }
};