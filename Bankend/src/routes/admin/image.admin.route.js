// ✅ src/routes/admin/image.admin.route.js
import express from 'express'
import { deleteImage, reorderImages } from '../../controllers/image.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js'
import { authorizeRole } from '../../middlewares/role.middleware.js'

const router = express.Router()

router.use(authenticate)
router.use(authorizeRole('admin'))

router.delete('/:id', deleteImage) // ลบรูปภาพเดี่ยว
router.patch('/reorder/:store_id', reorderImages) // จัดลำดับรูปใหม่

export default router