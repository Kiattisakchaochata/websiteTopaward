// ✅ CategoryPage.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { categorySchema } from "../../validations/category.validation";
import axiosInstance from "../../config/axiosInstance";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import LoaderSpinner from "../../components/LoaderSpinner";
import CategoryEditModal from "../../components/CategoryEditModal";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({ resolver: yupResolver(categorySchema) });

  const watchFields = watch();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/admin/categories");
      setCategories(res.data.categories);
    } catch (err) {
      Swal.fire("โหลดข้อมูลล้มเหลว", "ไม่สามารถโหลดหมวดหมู่ได้", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.coverImage[0]) {
        formData.append("cover_image", data.coverImage[0]);
      }

      const res = await axiosInstance.post("/admin/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSubmitting(false);
      reset();
      await fetchCategories();
      setTimeout(() => {
        Swal.fire("สำเร็จ", res.data.message, "success");
      }, 100);
    } catch (err) {
      setIsSubmitting(false);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        err.response?.data?.message || "ไม่สามารถดำเนินการได้",
        "error"
      );
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณจะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      setIsSubmitting(true);
      try {
        const res = await axiosInstance.delete(`/admin/categories/${id}`);
        setIsSubmitting(false);
        await fetchCategories();
        setTimeout(() => {
          Swal.fire("ลบสำเร็จ", res.data.message, "success");
        }, 100);
      } catch (err) {
        setIsSubmitting(false);
        Swal.fire(
          "เกิดข้อผิดพลาด",
          err.response?.data?.message || "ไม่สามารถลบได้",
          "error"
        );
      }
    }
  };

  const isFormFilled = watchFields.name?.trim()?.length > 0;

  return (
    <>
      {(isLoading || isSubmitting) && (
        <LoaderSpinner text={isLoading ? "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14\u0e2b\u0e21\u0e27\u0e14\u0e2b\u0e21\u0e39\u0e48..." : "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23..."} />
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">เพิ่มหมวดหมู่</h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <div>
              <label className="block mb-1 font-medium">ชื่อหมวดหมู่</label>
              <input
                {...register("name")}
                className="input input-bordered w-full text-white"
                placeholder="เช่น คลินิก"
              />
              <p className="text-red-500 text-sm">{errors.name?.message}</p>
            </div>

            <div>
              <label className="block mb-1 font-medium">อัปโหลดรูปภาพ</label>
              <input
                {...register("coverImage")}
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
              />
              <p className="text-red-500 text-sm">{errors.coverImage?.message}</p>
            </div>

            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={!isFormFilled || isSubmitting}
            >
              เพิ่มหมวดหมู่
            </button>
          </form>
        </div>

        <div className="mt-10 bg-white rounded-xl shadow p-6 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">รายการหมวดหมู่</h2>
          <table className="table w-full min-w-[600px]">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อหมวดหมู่</th>
                <th>รูปปก</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id} className="text-center">
                  <td>{index + 1}</td>
                  <td>{cat.name}</td>
                  <td>
                    {cat.cover_image && (
                      <img
                        src={cat.cover_image}
                        alt="cover"
                        className="w-20 h-14 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="space-x-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(cat)}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(cat.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CategoryEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          category={editingCategory}
          onSuccess={fetchCategories}
        />
      </div>
    </>
  );
};

export default CategoryPage;


