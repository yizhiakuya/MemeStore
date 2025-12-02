import express from 'express';
import * as memeController from '../controllers/memeController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', memeController.getMemes);
router.get('/:id', memeController.getMemeById);
router.post('/', upload.single('file'), memeController.uploadMeme);
router.put('/:id', memeController.updateMeme);
router.delete('/:id', memeController.deleteMeme);

export default router;
