const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/heic', 'image/heif', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.heic', '.heif', '.webp'];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  console.log('Received file mimetype:', file.mimetype);
  console.log('Received file extension:', fileExtension);

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload a JPEG, JPG, PNG, PDF, HEIC, or WebP file.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
}).fields([
  { name: 'file', maxCount: 1 },             // Original supporting document
  { name: 'userImage', maxCount: 1 },        // User's profile photo
  { name: 'citizenshipImage', maxCount: 1 }  // Citizenship proof image
]);

module.exports = upload;