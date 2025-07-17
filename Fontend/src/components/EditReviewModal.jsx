// src/components/EditReviewModal.jsx
import { useState } from "react"
import { FaStar } from "react-icons/fa"
import axiosInstance from "../config/axiosInstance"
import Swal from "sweetalert2"

function EditReviewModal({ review, onClose, onSuccess }) {
  const [rating, setRating] = useState(review.rating)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState(review.comment || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axiosInstance.patch(`/reviews/${review.id}`, { rating, comment })
      Swal.fire("สำเร็จ", "แก้ไขรีวิวเรียบร้อยแล้ว", "success")
      onSuccess?.()
      onClose?.()
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถแก้ไขรีวิวได้", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <h3 className="text-xl font-bold mb-4">แก้ไขรีวิว</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">คะแนน ({rating} / 5)</label>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => {
                const value = i + 1
                return (
                  <label key={i}>
                    <input
                      type="radio"
                      value={value}
                      onClick={() => setRating(value)}
                      className="hidden"
                    />
                    <FaStar
                      size={26}
                      className="cursor-pointer"
                      color={value <= (hover || rating) ? "#facc15" : "#e5e7eb"}
                      onMouseEnter={() => setHover(value)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium">คอมเมนต์</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border rounded p-2"
              placeholder="แก้ไขคอมเมนต์ของคุณ..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm bg-gray-300 text-black"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={rating === 0 || loading}
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditReviewModal