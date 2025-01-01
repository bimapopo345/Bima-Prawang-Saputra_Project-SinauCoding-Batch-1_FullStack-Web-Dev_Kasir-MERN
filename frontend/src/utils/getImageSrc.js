// frontend/src/utils/getImageSrc.js
export const getImageSrc = (image) => {
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";

  if (!image) {
    // Jika tidak ada gambar, gunakan gambar default
    return "/uploads/default-menu.png";
  }

  // Periksa apakah gambar adalah URL eksternal
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Jika gambar adalah path lokal, tambahkan BACKEND_URL
  return `${BACKEND_URL}${image}`;
};
