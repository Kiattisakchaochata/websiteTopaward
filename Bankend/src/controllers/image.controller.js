// ✅ src/controllers/image.controller.js
import prisma from '../config/prisma.config.js'
import cloudinary from '../config/cloudinary.config.js'

// ✅ DELETE: ลบรูปภาพเดี่ยว (จาก DB + Cloudinary)
export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params

    const image = await prisma.image.findUnique({ where: { id } })
    if (!image) return res.status(404).json({ message: 'ไม่พบรูปภาพนี้' })

    // ✅ ลบจาก Cloudinary
    const publicId = image.image_url.split('/').pop().split('.')[0]
    await cloudinary.uploader.destroy(`store-images/${publicId}`)

    // ✅ ลบจาก DB
    await prisma.image.delete({ where: { id } })

    res.json({ message: 'ลบรูปภาพสำเร็จ' })
  } catch (err) {
    next(err)
  }
}

// ✅ PATCH: จัดลำดับรูปใหม่ทั้งหมดในร้านค้า
export const reorderImages = async (req, res, next) => {
  try {
    const { store_id } = req.params
    const { order } = req.body // [{ id, order_number }, ...]

    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'กรุณาส่งข้อมูล order เป็น array' })
    }

    const updates = await Promise.all(
      order.map(({ id, order_number }) =>
        prisma.image.update({ where: { id }, data: { order_number } })
      )
    )

    res.json({ message: 'จัดลำดับรูปสำเร็จ', images: updates })
  } catch (err) {
    next(err)
  }
}