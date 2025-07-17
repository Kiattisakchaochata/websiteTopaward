// src/components/ReviewForm.jsx
import { useState } from "react"
import { FaStar } from "react-icons/fa"
import Swal from "sweetalert2"
import axiosInstance from "../config/axiosInstance"
import { useNavigate } from "react-router-dom"

function ReviewForm({ storeId, onSuccess, averageRating = 0 }) {
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post(`/reviews/${storeId}`, {
        rating,
        comment,
      })
      Swal.fire("สำเร็จ", "ส่งรีวิวเรียบร้อยแล้ว", "success")
      setRating(0)
      setComment("")
      onSuccess?.()
    } catch (err) {
      console.error("Error submitting review:", err)
      Swal.fire("เกิดข้อผิดพลาด", "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถส่งรีวิวและให้คะแนนได้", "error")
    }
  }

  if (!token) {
    return (
      <div className="p-5 bg-white rounded-lg text-center text-gray-700">
        <p>กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว ⭐</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-black">เขียนรีวิว</h2>

      <div className="mb-3">
        <label className="font-semibold text-black">
          คะแนน ({averageRating.toFixed(1)} / 5)
        </label>
        <div className="flex gap-1 mt-1">
          {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1
            return (
              <label key={i}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setRating(ratingValue)}
                  className="hidden"
                />
                <FaStar
                  className="cursor-pointer"
                  size={28}
                  color={ratingValue <= (hover || rating) ? "#facc15" : "#e5e7eb"}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            )
          })}
        </div>
      </div>

      <div className="mb-3">
        <label className="font-semibold text-black">คอมเมนต์</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400"
          rows={4}
          placeholder="เขียนคอมเมนต์ของคุณ..."
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        ส่งรีวิว
      </button>
    </form>
  )
}

export default ReviewForm