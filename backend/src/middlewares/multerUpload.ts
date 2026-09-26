import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
 fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
 destination: (_req, _file, cb) => {
 cb(null, uploadDir);
 },
 filename: (_req, file, cb) => {
 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
 const ext = path.extname(file.originalname).toLowerCase();
 cb(null, `file-${uniqueSuffix}${ext}`);
 },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
 const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx'];
 const ext = path.extname(file.originalname).toLowerCase();

 const prohibitedExtensions = ['.exe', '.bat', '.sh', '.cmd', '.js', '.msi', '.vbs'];

 if (prohibitedExtensions.includes(ext)) {
 return cb(new Error('Executable and script files are strictly prohibited!'));
 }

 if (allowedExtensions.includes(ext)) {
 cb(null, true);
 } else {
 cb(new Error(`File format ${ext} is not allowed. Supported formats: PDF, PNG, JPG, DOCX, XLSX`));
 }
};

export const upload = multer({
 storage,
 fileFilter,
 limits: {
 fileSize: env.MAX_FILE_SIZE, // 5MB
 },
});
