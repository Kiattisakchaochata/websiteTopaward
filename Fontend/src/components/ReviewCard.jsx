// src/components/ReviewCard.jsx
import { FaStar } from "react-icons/fa"
import { HiOutlineDotsVertical } from "react-icons/hi"
import { useState } from "react"
import Swal from "sweetalert2"
import axiosInstance from "../config/axiosInstance"
import EditReviewModal from "./EditReviewModal"

function ReviewCard({ review, currentUserId, onUpdate }) {
  const { id, user, rating, comment } = review
  const [showEdit, setShowEdit] = useState(false)

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบรีวิว?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    })

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/reviews/${id}`)
        Swal.fire("สำเร็จ", "ลบรีวิวเรียบร้อยแล้ว", "success")
        onUpdate?.()
      } catch (err) {
        Swal.fire("ผิดพลาด", "ไม่สามารถลบรีวิวได้", "error")
      }
    }
  }

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow relative">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold">{user?.name || "ผู้ใช้ไม่ทราบชื่อ"}</div>
          <p className="text-gray-700 mt-1">{comment || "ไม่มีคอมเมนต์"}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={18} color={i < rating ? "#facc15" : "#e5e7eb"} />
            ))}
          </div>

          {/* ✅ ซ่อน dropdown ตอนเปิด modal */}
          {String(user.id) === String(currentUserId) && !showEdit && (
            <div className="dropdown dropdown-end z-10">
              <button tabIndex={0} className="btn btn-ghost btn-sm">
                <HiOutlineDotsVertical size={20} />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-28 z-10"
              >
                <li>
                  <button
                    className="text-blue-600"
                    onClick={() => setShowEdit(true)}
                  >
                    แก้ไข
                  </button>
                </li>
                <li>
                  <button className="text-red-500" onClick={handleDelete}>
                    ลบ
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditReviewModal
          review={review}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false)
            onUpdate?.()
          }}
        />
      )}
    </div>
  )
}

export default ReviewCard