import { Router, Request, Response, NextFunction } from 'express';
import { uploadExcel, importExcel, getExcelUploads, getUploadDetails, deleteExcelUpload, deleteImportedCases } from '../controllers/excelController';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err: any) {
    console.warn('⚠️ Notice: Could not create upload directory:', err.message);
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xls Excel files are allowed.'));
    }
  },
});

// STAGE 1: FILE UPLOAD MIDDLEWARE (Multipart / Multer Handling)
const handleFileUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.error('[STAGE 1 FILE UPLOAD ERROR] Multer Error:', err);
      return res.status(400).json({ message: `STAGE 1 FILE UPLOAD ERROR: ${err.message}` });
    } else if (err) {
      console.error('[STAGE 1 FILE UPLOAD ERROR] Processing Error:', err);
      return res.status(400).json({ message: `STAGE 1 FILE UPLOAD ERROR: ${err.message}` });
    }
    next();
  });
};

const router = Router();

router.use(authenticateToken);

router.post('/upload', requireRole(['ADMIN', 'MANAGER']), handleFileUploadMiddleware, uploadExcel);
router.post('/import', requireRole(['ADMIN', 'MANAGER']), importExcel);
router.get('/uploads', requireRole(['ADMIN', 'MANAGER']), getExcelUploads);
router.get('/uploads/:id', requireRole(['ADMIN', 'MANAGER']), getUploadDetails);
router.delete('/uploads/:id', requireRole(['ADMIN']), deleteExcelUpload);
router.delete('/uploads/:id/cases', requireRole(['ADMIN']), deleteImportedCases);

export default router;
