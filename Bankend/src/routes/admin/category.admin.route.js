import express from 'express'
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getAllCategoriesAdmin,
  getCategoryByIdAdmin
} from '../../controllers/category.controller.js'

import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorizeRole } from '../../middlewares/role.middleware.js'
import { validate } from '../../middlewares/validator.middleware.js'
import { categorySchema } from '../../validations/category.validation.js'
import { upload } from '../../middlewares/upload.middleware.js'

const router = express.Router()

// ✅ GET: หมวดหมู่ทั้งหมด
router.get(
  '/',
  authenticate,
  authorizeRole('admin'),
  getAllCategoriesAdmin
)

// ✅ GET: หมวดหมู่รายตัว
router.get(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  getCategoryByIdAdmin
)

// ✅ POST: สร้าง (พร้อม upload)
router.post(
  '/',
  authenticate,
  authorizeRole('admin'),
  upload.single('cover_image'), // ✅ ต้องมาก่อน validate
  validate(categorySchema),
  createCategory
)

// ✅ PATCH: แก้ไข (พร้อม upload)
router.patch(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  upload.single('cover_image'), // ✅ ต้องมาก่อน validate
  validate(categorySchema),
  updateCategory
)

// ✅ DELETE: ลบ
router.delete(
  '/:id',
  authenticate,
  authorizeRole('admin'),
  deleteCategory
)

export default router