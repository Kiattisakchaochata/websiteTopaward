import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import StoreExpireInput from "../../admin/components/StoreExpireInput";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import StoreCard from "../../admin/components/StoreCard.jsx";
import axiosInstance from "../../config/axiosInstance";
import Swal from "sweetalert2";
import StoreEditModal from "../../components/StoreEditModal";
import LoaderSpinner from "../../components/LoaderSpinner";
import CoverImageModal from "../components/CoverImageModal.jsx";
const storeSchema = yup.object().shape({
  name: yup.string().required("กรุณากรอกชื่อร้าน"),
  address: yup.string().nullable(),
  description: yup.string().nullable(),
  category_id: yup.string().required("กรุณาเลือกหมวดหมู่"),
  order_number: yup.number().nullable(),
});

const StorePage = () => {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [imageOrders, setImageOrders] = useState([1, 2, 3, 4, 5]);

  // ✅ สำหรับแก้ไขภาพหน้าปก
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [selectedCoverStore, setSelectedCoverStore] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(storeSchema),
    mode: "onChange",
  });

  const watchFields = watch();

  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, []);

  const fetchStores = async () => {
    const res = await axiosInstance.get("/admin/stores");
    const sorted = res.data.stores.sort((a, b) => b.order_number - a.order_number);
    setStores(sorted);
  };

  const fetchCategories = async () => {
    const res = await axiosInstance.get("/admin/categories");
    setCategories(res.data.categories);
  };

  const getAvailableOrderNumbers = (categoryId) => {
    const used = stores.filter((s) => s.category_id === categoryId).map((s) => s.order_number);
    return [1, 2, 3, 4, 5].filter((n) => !used.includes(n));
  };

  const handleOrderChange = (index, value) => {
    const newOrders = [...imageOrders];
    newOrders[index] = Number(value);
    setImageOrders(newOrders);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("address", data.address || "");
    formData.append("description", data.description || "");
    formData.append("category_id", data.category_id);
    formData.append("order_number", Number(data.order_number));
    formData.append("expired_at", data.expired_at || "");
    if (data.cover_image?.[0]) {
      formData.append("cover", data.cover_image[0]);
    }
    const orderSet = new Set();
    for (let i = 0; i < 5; i++) {
      const file = data[`images_${i}`];
      const order = imageOrders[i];
      if (file && file.length > 0) {
        if (orderSet.has(order)) {
          Swal.fire("ผิดพลาด", `ลำดับรูปภาพซ้ำกันที่ ${order} กรุณาเลือกใหม่`, "error");
          return;
        }
        orderSet.add(order);
        formData.append("images", file[0]);
        formData.append("orders", order);
      }
    }
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/admin/stores", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("สำเร็จ", res.data.message, "success");
      reset();
      setImageOrders([1, 2, 3, 4, 5]);
      fetchStores();
    } catch (err) {
      Swal.fire("ผิดพลาด", err.response?.data?.message || "ไม่สามารถเพิ่มได้", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "ลบร้านค้านี้?",
      text: "คุณแน่ใจหรือไม่ว่าจะลบร้านนี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });
    if (confirm.isConfirmed) {
      await axiosInstance.delete(`/admin/stores/${id}`);
      Swal.fire("ลบแล้ว", "ร้านค้าถูกลบเรียบร้อย", "success");
      fetchStores();
    }
  };

  const handleEditSuccess = async (id, formData) => {
    try {
      const res = await axiosInstance.patch(`/admin/stores/${id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("สำเร็จ", res.data.message || "อัปเดตร้านค้าแล้ว", "success");
      fetchStores();
      setIsEditModalOpen(false);
    } catch (err) {
      Swal.fire("ผิดพลาด", err.response?.data?.message || "ไม่สามารถอัปเดตได้", "error");
    }
  };
  const handleReactivate = async (store) => {
    const { value: newDate } = await Swal.fire({
      title: `เปิดใช้งานร้าน "${store.name}" อีกครั้ง`,
      text: "กรุณาระบุวันหมดอายุใหม่",
      input: "date",
      inputAttributes: {
        min: new Date().toISOString().split("T")[0],
      },
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      inputValidator: (value) => {
        if (!value) return "กรุณาระบุวันหมดอายุ";
      },
    });

    if (newDate) {
      try {
        const res = await axiosInstance.patch(`/admin/stores/${store.id}/reactivate`, {
          new_expired_at: newDate,
        });
        Swal.fire("สำเร็จ", res.data.message || "เปิดใช้งานเรียบร้อย", "success");
        fetchStores();
      } catch (err) {
        Swal.fire("ผิดพลาด", err.response?.data?.message || "เปิดใช้งานไม่สำเร็จ", "error");
      }
    }
  };
  const handleOrderNumberChange = async (storeId, categoryId, newOrder) => {
  console.log("🟡 PATCH payload:", {
    category_id: categoryId,
    order_number: newOrder,
  });

  try {
    const res = await axiosInstance.patch(`/admin/stores/${storeId}/order`, {
      category_id: categoryId,
      order_number: Number(newOrder),
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    Swal.fire("สำเร็จ", res.data.message || "อัปเดตลำดับเรียบร้อย", "success");
    await fetchStores();
  } catch (err) {
    Swal.fire("ผิดพลาด", err.response?.data?.message || "อัปเดตลำดับไม่สำเร็จ", "error");
  }
};

  const handleOpenCoverModal = (store) => {
    setSelectedCoverStore(store);
    setCoverModalOpen(true);
  };

  return (
    <>
      {isSubmitting && <LoaderSpinner text="กำลังเพิ่มร้านค้า..." />}
      <div className="max-w-6xl mx-auto py-10 space-y-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-black">เพิ่มร้านค้า</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-black">ชื่อร้าน:</label>
              <input {...register("name")} className="input input-bordered w-full bg-black text-white" />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-black">ที่อยู่:</label>
              <input {...register("address")} className="input input-bordered w-full bg-black text-white" />
            </div>

            <div>
              <label className="text-black">รายละเอียด:</label>
              <textarea {...register("description")} className="textarea textarea-bordered w-full bg-black text-white" />
            </div>

            <div>
              <label className="text-black">หมวดหมู่:</label>
              <select {...register("category_id")} className="select select-bordered w-full bg-black text-white">
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="text-black">วันหมดอายุ:</label>
              <StoreExpireInput register={register} />
            </div>
            <div>
              <label className="text-black">ลำดับร้าน (ในหมวดหมู่):</label>
              <select {...register("order_number")} className="select select-bordered w-full bg-black text-white">
                <option value="">-- เลือกลำดับ --</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-black">ภาพหน้าป้าร้านค้า (cover):</label>
              <input type="file" {...register("cover_image")} className="file-input w-full text-white bg-black" />
            </div>

            <div>
              <label className="text-black">รูปภาพเพิ่มเติม (สูงสุด 5 รูป):</label>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input type="file" {...register(`images_${i}`)} className="file-input bg-black text-white" />
                  <select
                    value={imageOrders[i]}
                    onChange={(e) => handleOrderChange(i, e.target.value)}
                    className="select select-sm select-bordered bg-black text-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span className="text-black">ลำดับ</span>
                </div>
              ))}
            </div>

            <button type="submit" disabled={!isValid || isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มร้านค้า"}
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-black">ร้านค้าทั้งหมด</h2>
          {categories.map((category) => {
            const storesByCat = stores.filter((s) => s.category_id === category.id).sort((a, b) => b.order_number - a.order_number);
            if (storesByCat.length === 0) return null;
            return (
              <div key={category.id} className="mb-10">
                <h3 className="text-lg font-bold mb-2 text-black">{category.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {storesByCat.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onEdit={() => {
                        setSelectedStore(store);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={() => handleDelete(store.id)}
                      onEditCover={() => handleOpenCoverModal(store)}
                      onOrderChange={(newOrder) => handleOrderNumberChange(store.id, store.category_id, newOrder)}
                      totalInCategory={storesByCat.length}
                      onReactivate={() => handleReactivate(store)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal แก้ไขข้อมูลร้าน */}
        {selectedStore && (
          <StoreEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            store={selectedStore}
            categories={categories}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* ✅ Modal แก้ไขภาพหน้าปก */}
        {selectedCoverStore && (
          <CoverImageModal
            isOpen={coverModalOpen}
            onClose={() => setCoverModalOpen(false)}
            store={selectedCoverStore}
            onSuccess={fetchStores}
          />
        )}
      </div>
    </>
  );
};

export default StorePage;