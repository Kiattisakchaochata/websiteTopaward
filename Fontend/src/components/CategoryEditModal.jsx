// ✅ CategoryEditModal.jsx (แก้ปัญหา Loader ไม่ปิดหลัง Swal)
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../config/axiosInstance";
import LoaderSpinner from "./LoaderSpinner";

const CategoryEditModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [editForm, setEditForm] = useState({ name: "", file: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setEditForm({ name: category.name || "", file: null });
    }
  }, [category]);

  const handleChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setEditForm((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", editForm.name.trim());
      if (editForm.file) {
        formData.append("cover_image", editForm.file);
      }

      const res = await axiosInstance.patch(
        `/admin/categories/${category.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // ✅ ให้ loader ปิดก่อนแล้วค่อย show alert เพื่อ smooth
      setIsSubmitting(false);
      onClose();
      onSuccess();

      setTimeout(() => {
        Swal.fire("สำเร็จ", res.data.message || "อัปเดตหมวดหมู่แล้ว", "success");
      }, 200); // หน่วงนิดเพื่อให้ modal ปิดจริง ๆ ก่อนแสดง Swal
    } catch (err) {
      setIsSubmitting(false);
      Swal.fire(
        "ผิดพลาด",
        err.response?.data?.message || "ไม่สามารถอัปเดตหมวดหมู่ได้",
        "error"
      );
    }
  };

  if (!isOpen || !category) return null;

  return (
    <>
      {isSubmitting && <LoaderSpinner text="กำลังอัปเดตหมวดหมู่..." />}

      <dialog open className="modal">
        <div className="modal-box bg-white text-black">
          <h3 className="font-bold text-lg mb-4">แก้ไขหมวดหมู่</h3>
          <form onSubmit={handleSubmitEdit} className="space-y-3" encType="multipart/form-data">
            <input
              name="name"
              value={editForm.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-gray-300 bg-gray-100 text-black"
              placeholder="ชื่อหมวดหมู่"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full file-input file-input-bordered"
            />
            <div className="flex justify-end gap-2 pt-4">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                บันทึก
              </button>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default CategoryEditModal;