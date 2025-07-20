// ✅ src/routes/admin/store.admin.route.js
import express from 'express';
import {
  createStore,
  getAllStores,
  getStoreById,
  getStoreLoyaltyStats,
  updateStore,
  deleteStore,
  deleteStoreImage,
  updateStoreOrder,
  updateStoreCover,
  getExpiringSoonStores, // ✅ รวมใน import เดียวได้เลย
  getExpiredStores,
  reactivateStore,
} from '../../controllers/store.controller.js';

import {
  storeUpload,
  storeUploadSingleCover,
} from '../../middlewares/upload.middleware.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRole } from '../../middlewares/role.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRole('admin'));

// ✅ เพิ่ม routes ใหม่
router.get('/expired', getExpiredStores);
router.get('/expiring-soon', getExpiringSoonStores);
router.patch('/:id/reactivate', reactivateStore);

router.get("/loyalty", getStoreLoyaltyStats);
router.get('/', getAllStores);
router.get('/:id', getStoreById);
router.post('/', storeUpload, createStore);
router.patch('/:id', storeUpload, updateStore);
router.patch('/cover/:id', storeUploadSingleCover, updateStoreCover);
router.delete('/:id', deleteStore);
router.delete('/images/:imageId', deleteStoreImage);
router.patch('/:id/order', updateStoreOrder);

export default router;