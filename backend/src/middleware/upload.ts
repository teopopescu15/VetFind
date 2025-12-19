import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// ===========================
// MULTER STORAGE CONFIGURATION
// ===========================

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const companyId = req.params.id;
    const uploadDir = path.join(__dirname, '../../uploads/companies', companyId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `photo_${timestamp}${ext}`);
  }
});

// ===========================
// FILE TYPE VALIDATION
// ===========================

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(ext);

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only image files are allowed (JPEG, PNG, WebP)'));
};

// ===========================
// MULTER CONFIGURATION
// ===========================

export const uploadPhoto = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter,
});

// ===========================
// IMAGE OPTIMIZATION MIDDLEWARE (Sharp)
// ===========================

export const optimizeImage = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file) return next();

  try {
    const filePath = req.file.path;
    const optimizedPath = filePath.replace(
      path.extname(filePath),
      '_optimized' + path.extname(filePath)
    );

    // Resize and compress image
    // - Max dimensions: 1200x1200 (maintains aspect ratio)
    // - JPEG quality: 85% (good balance of quality/size)
    // - Progressive: Better loading experience
    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',           // Maintain aspect ratio
        withoutEnlargement: true // Don't upscale small images
      })
      .jpeg({
        quality: 85,      // 85% quality
        progressive: true // Progressive JPEG
      })
      .toFile(optimizedPath);

    // Replace original with optimized
    fs.unlinkSync(filePath);
    fs.renameSync(optimizedPath, filePath);

    next();
  } catch (error) {
    next(error);
  }
};
