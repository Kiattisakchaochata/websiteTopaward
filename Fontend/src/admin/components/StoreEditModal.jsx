import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";

const schema = yup.object().shape({
  name: yup.string().required("กรุณากรอกชื่อร้าน"),
  address: yup.string().nullable(),
  description: yup.string().nullable(),
  category_id: yup.string().required("กรุณาเลือกหมวดหมู่"),
  order_number: yup.number().nullable(),
});

const StoreEditModal = ({ isOpen, onClose, store, categories, onSuccess }) => {
  const [coverFile, setCoverFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (store) {
      setValue("name", store.name || "");
      setValue("address", store.address || "");
      setValue("description", store.description || "");
      setValue("social_links", store.social_links || "");
      setValue("category_id", store.category_id || "");
      setValue("order_number", store.order_number || 1);
    }
  }, [store, setValue]);

  const uploadCoverImage = async () => {
    if (!coverFile) return;
    const formData = new FormData();
    formData.append("cover", coverFile);
    try {
      await axios.patch(`/api/admin/stores/${store.id}/cover`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("❌ อัปโหลด Cover ผิดพลาด:", err);
      throw new Error("อัปโหลดภาพหน้าปกไม่สำเร็จ");
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("address", data.address || "");
    formData.append("description", data.description || "");
    formData.append("social_links", data.social_links || "");
    formData.append("category_id", data.category_id);
    formData.append("order_number", Number(data.order_number));

    try {
      setIsSubmitting(true);

      // อัปเดตข้อมูลร้าน
      await onSuccess(store.id, formData);

      // ถ้ามีการเปลี่ยน cover image → อัปเดตผ่าน API แยก
      if (coverFile) {
        await uploadCoverImage();
      }

      Swal.fire("สำเร็จ", "อัปเดตร้านค้าเรียบร้อย", "success");
      onClose();
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึก:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm flex justify-center items-center px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative">
        <h2 className="text-xl font-bold mb-4 text-black">แก้ไขข้อมูลร้านค้า</h2>

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="text-black">ชื่อร้าน:</label>
            <input {...register("name")} className="input input-bordered w-full text-white bg-gray-900" />
            <p className="text-red-500 text-sm">{errors.name?.message}</p>
          </div>

          <div>
            <label className="text-black">ที่อยู่:</label>
            <input {...register("address")} className="input input-bordered w-full text-white bg-gray-900" />
          </div>

          <div>
            <label className="text-black">รายละเอียด:</label>
            <textarea {...register("description")} rows={3} className="textarea textarea-bordered w-full text-white bg-gray-900" />
          </div>

          <div>
            <label className="text-black">ลิงก์โซเชียล:</label>
            <input {...register("social_links")} className="input input-bordered w-full text-white bg-gray-900" />
          </div>

          <div>
            <label className="text-black">หมวดหมู่:</label>
            <select {...register("category_id")} className="select select-bordered w-full text-white bg-gray-900">
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-red-500 text-sm">{errors.category_id?.message}</p>
          </div>

          <div>
            <label className="text-black">ลำดับร้าน:</label>
            <input type="number" {...register("order_number")} className="input input-bordered w-full text-white bg-gray-900" />
          </div>

          {/* ✅ Cover Image preview + upload */}
          {store.cover_image && (
            <div>
              <label className="text-black block mb-1">ภาพหน้าปกปัจจุบัน:</label>
              <img src={store.cover_image} alt="cover" className="w-full h-40 object-cover rounded" />
            </div>
          )}

          <div>
            <label className="text-black">เปลี่ยนภาพหน้าปกร้านค้า:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="file-input w-full text-white bg-gray-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn btn-warning"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreEditModal;