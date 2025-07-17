import prisma from '../config/prisma.config.js'
import cloudinary from '../config/cloudinary.config.js'
import fs from 'fs/promises'

// ✅ สร้างหมวดหมู่ใหม่ พร้อมตรวจสอบลำดับ (order_number) ซ้ำ
export const createCategory = async (req, res, next) => {
  try {
    const { name, order_number } = req.body
    let cover_image = null

    // ✅ อัปโหลดภาพปก
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'category-covers',
      })
      cover_image = result.secure_url
      await fs.unlink(req.file.path)
    }

    let finalOrderNumber = Number(order_number)

    // ✅ ถ้าไม่ส่ง order_number มา → สร้าง auto = count + 1
    if (!finalOrderNumber) {
      const count = await prisma.category.count()
      finalOrderNumber = count + 1
    } else {
      // ✅ ถ้าส่ง order_number มา → ตรวจสอบซ้ำ
      const isDuplicate = await prisma.category.findFirst({
        where: { order_number: finalOrderNumber },
      })

      if (isDuplicate) {
        return res.status(400).json({ message: 'ลำดับหมวดหมู่นี้ถูกใช้ไปแล้ว' })
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        order_number: finalOrderNumber,
        cover_image,
      },
    })

    res.status(201).json({ message: 'สร้างหมวดหมู่สำเร็จ', category })
  } catch (err) {
    next(err)
  }
}

// ✅ อัปโหลดเฉพาะรูปภาพ (แยกกรณีพิเศษ)
export const uploadCategoryCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาเลือกรูปภาพ' })
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'category-covers',
    })

    await fs.unlink(req.file.path)

    res.status(200).json({
      message: 'อัปโหลดภาพปกสำเร็จ',
      image_url: result.secure_url,
    })
  } catch (err) {
    next(err)
  }
}

// 🔁 แก้ไขหมวดหมู่ พร้อมตรวจสอบลำดับซ้ำ (ถ้ามีการเปลี่ยน order_number)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, order_number } = req.body
    let cover_image = req.body.cover_image

    // ตรวจสอบหากมีการส่ง order_number มาใหม่ และไม่ใช่ของตัวเอง
    if (order_number) {
      const duplicate = await prisma.category.findFirst({
        where: {
          order_number: Number(order_number),
          NOT: { id },
        },
      })
      if (duplicate) {
        return res.status(400).json({ message: 'ลำดับหมวดหมู่นี้ถูกใช้ไปแล้ว' })
      }
    }

    // อัปโหลดรูปใหม่ถ้ามีไฟล์
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'category-covers',
      })
      cover_image = result.secure_url
      await fs.unlink(req.file.path)
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        order_number: order_number ? Number(order_number) : undefined,
        cover_image,
      },
    })

    res.json({
      message: 'อัปเดตหมวดหมู่สำเร็จ',
      category,
    })
  } catch (err) {
    next(err)
  }
}

// 🗑️ ลบหมวดหมู่
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    await prisma.category.delete({ where: { id } })
    res.json({ message: 'ลบหมวดหมู่สำเร็จ' })
  } catch (err) {
    next(err)
  }
}

// 🔍 GET หมวดหมู่ทั้งหมด (Public)
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order_number: 'asc' },
    })
    res.json(categories)
  } catch (err) {
    next(err)
  }
}

// 🔍 GET หมวดหมู่ตาม ID (Public)
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return res.status(404).json({ message: 'ไม่พบหมวดหมู่' })
    res.json(category)
  } catch (err) {
    next(err)
  }
}

// 🔍 GET (Admin) ทั้งหมด
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order_number: 'asc' },
    })
    res.json({ categories })
  } catch (err) {
    next(err)
  }
}

// 🔍 GET (Admin) ตาม ID
export const getCategoryByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return res.status(404).json({ message: 'ไม่พบหมวดหมู่' })
    res.json(category)
  } catch (err) {
    next(err)
  }
}