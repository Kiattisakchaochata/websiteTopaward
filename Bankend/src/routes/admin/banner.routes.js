import express from 'express';
import multer from 'multer';
import { createBanner, getBanners, deleteBanner } from '../../controllers/banner.controller.js';

const upload = multer({ dest: 'temp/' });
const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('📥 [GET] /api/admin/banners');
  getBanners(req, res, next);
});

router.post('/', upload.single('image'), (req, res, next) => {
  console.log('📤 [POST] /api/admin/banners', req.body);
  createBanner(req, res, next);
});

router.delete('/:id', (req, res, next) => {
  console.log('❌ [DELETE] /api/admin/banners/:id', req.params.id);
  deleteBanner(req, res, next);
});

export default router;