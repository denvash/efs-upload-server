import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = "./uploads";

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

export const uploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (_req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});
