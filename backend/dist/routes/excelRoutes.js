"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const excelController_1 = require("../controllers/excelController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext === '.xlsx' || ext === '.xls') {
            cb(null, true);
        }
        else {
            cb(new Error('Only .xlsx and .xls Excel files are allowed.'));
        }
    },
});
// STAGE 1: FILE UPLOAD MIDDLEWARE (Multipart / Multer Handling)
const handleFileUploadMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            console.error('[STAGE 1 FILE UPLOAD ERROR] Multer Error:', err);
            return res.status(400).json({ message: `STAGE 1 FILE UPLOAD ERROR: ${err.message}` });
        }
        else if (err) {
            console.error('[STAGE 1 FILE UPLOAD ERROR] Processing Error:', err);
            return res.status(400).json({ message: `STAGE 1 FILE UPLOAD ERROR: ${err.message}` });
        }
        next();
    });
};
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/upload', (0, auth_1.requireRole)(['ADMIN', 'MANAGER']), handleFileUploadMiddleware, excelController_1.uploadExcel);
router.post('/import', (0, auth_1.requireRole)(['ADMIN', 'MANAGER']), excelController_1.importExcel);
router.get('/uploads', (0, auth_1.requireRole)(['ADMIN', 'MANAGER']), excelController_1.getExcelUploads);
router.get('/uploads/:id', (0, auth_1.requireRole)(['ADMIN', 'MANAGER']), excelController_1.getUploadDetails);
router.delete('/uploads/:id', (0, auth_1.requireRole)(['ADMIN']), excelController_1.deleteExcelUpload);
router.delete('/uploads/:id/cases', (0, auth_1.requireRole)(['ADMIN']), excelController_1.deleteImportedCases);
exports.default = router;
