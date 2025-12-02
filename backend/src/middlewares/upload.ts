import multer from 'multer';

const ALLOWED_MIMES = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIMES.join(', ')}`));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_SIZE
    }
});
