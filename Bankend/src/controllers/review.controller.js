// src/controllers/review.controller.js

import prisma from '../config/prisma.config.js'
import { createError } from '../utils/create-error.util.js'

// ✅ ดึงรีวิวตาม ID
export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } }
      }
    })

    if (!review) return next(createError(404, 'ไม่พบรีวิวนี้'))

    res.json(review)
  } catch (err) {
    next(err)
  }
}

// ✅ POST /reviews/:id → สร้างรีวิว
export const createReview = async (req, res, next) => {
  try {
    const { id: store_id } = req.params
    const { rating, comment } = req.body
    const user_id = req.user.id

    if (!rating || typeof rating !== 'number') {
      return next(createError(400, 'กรุณาระบุคะแนนที่ถูกต้อง'))
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || '',
        user: { connect: { id: user_id } },
        store: { connect: { id: store_id } }
      }
    })

    res.status(201).json({ message: 'รีวิวสำเร็จ', review })
  } catch (err) {
    next(err)
  }
}

// ✅ PATCH /reviews/:id → แก้ไขเฉพาะของตัวเอง
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const user_id = req.user.id

    const existingReview = await prisma.review.findUnique({ where: { id } })

    if (!existingReview) return next(createError(404, 'ไม่พบรีวิวนี้'))
    if (existingReview.user_id !== user_id) {
      return next(createError(403, 'ไม่มีสิทธิ์แก้ไขรีวิวนี้'))
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ?? existingReview.rating,
        comment: comment ?? existingReview.comment
      }
    })

    res.json({ message: 'อัปเดตรีวิวแล้ว', review: updatedReview })
  } catch (err) {
    next(err)
  }
}

// ✅ DELETE /reviews/:id → ลบเฉพาะของตัวเอง
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const user_id = req.user.id

    const existingReview = await prisma.review.findUnique({ where: { id } })

    if (!existingReview) return next(createError(404, 'ไม่พบรีวิวนี้'))
    if (existingReview.user_id !== user_id) {
      return next(createError(403, 'ไม่มีสิทธิ์ลบรีวิวนี้'))
    }

    await prisma.review.delete({ where: { id } })
    res.json({ message: 'ลบรีวิวเรียบร้อยแล้ว' })
  } catch (err) {
    next(err)
  }
}

// ✅ GET /stores/:id/reviews → ดูรีวิวของร้าน
export const getReviewsForStore = async (req, res, next) => {
  try {
    const { id: store_id } = req.params

    const reviews = await prisma.review.findMany({
      where: { store_id },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ store_id, reviews })
  } catch (err) {
    next(err)
  }
}