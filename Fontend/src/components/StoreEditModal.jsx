// components/StoreEditModal.jsx
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../config/axiosInstance";
import LoaderSpinner from "./LoaderSpinner";

const schema = yup.object().shape({
  name: yup.string().required("กรุณากรอกชื่อร้าน"),
  description: yup.string().nullable(),
  address: yup.string().nullable(),
  social_links: yup.string().nullable(),
  category_id: yup.string().required("กรุณาระบุหมวดหมู่"),
});

const isDuplicateOrder = (images) => {
  const orderSet = new Set();
  for (let img of images) {
    if (orderSet.has(img.order_number)) return true;
    orderSet.add(img.order_number);
  }
  return false;
};

export default function StoreEditModal({ isOpen, onClose, onSuccess, store, categories }) {
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeImages, setStoreImages] = useState([]);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      social_links: "",
      category_id: "",
    },
  });

  useEffect(() => {
    if (store) {
      reset({
        name: store.name || "",
        description: store.description || "",
        address: store.address || "",
        social_links: store.social_links || "",
        category_id: store.category_id || "",
      });
      const sortedImages = [...(store.images || [])].sort((a, b) => a.order_number - b.order_number);
      setStoreImages(sortedImages);
      setIsChanged(false);
    }
  }, [store, reset]);

  useEffect(() => {
    const subscription = watch(() => {
      setIsChanged(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleOrderChange = (index, newOrder) => {
    const parsedOrder = Number(newOrder);
    if (isNaN(parsedOrder) || parsedOrder < 1 || parsedOrder > storeImages.length) return;

    const updatedImages = [...storeImages];
    updatedImages[index].order_number = parsedOrder;

    if (isDuplicateOrder(updatedImages)) {
      setErrorMessage("ลำดับภาพซ้ำกัน กรุณาเลือกลำดับใหม่");
      setShowErrorModal(true);
      return;
    }

    const sorted = [...updatedImages].sort((a, b) => a.order_number - b.order_number);
    setStoreImages(sorted);
    setIsChanged(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    if (isDuplicateOrder(storeImages)) {
      setErrorMessage("ลำดับรูปภาพซ้ำกัน กรุณาตรวจสอบอีกครั้ง");
      setShowErrorModal(true);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("address", data.address || "");
    formData.append("social_links", data.social_links || "");
    formData.append("category_id", data.category_id);

    storeImages.forEach((img) => {
      formData.append(
        "existing_image_orders",
        JSON.stringify({ id: img.id, order_number: Number(img.order_number) })
      );
    });

    for (let i = 0; i < 5; i++) {
      const file = data[`images_${i}`];
      if (file && file.length > 0) {
        formData.append("images", file[0]);
      }
    }

    try {
      await onSuccess(store.id, formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (img) => {
    setImageToDelete(img);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setImageToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/admin/stores/images/${imageToDelete.id}`);

      const updatedImages = storeImages.filter((img) => img.id !== imageToDelete.id);
      const reOrdered = updatedImages.map((img, index) => ({
        ...img,
        order_number: index + 1,
      }));

      setStoreImages(reOrdered);
      setIsChanged(true);
      closeDeleteModal();
    } catch (err) {
      setErrorMessage("ลบรูปไม่สำเร็จ");
      setShowErrorModal(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {isSubmitting && <LoaderSpinner text="กำลังบันทึกข้อมูล..." />}
      {isDeleting && <LoaderSpinner text="กำลังลบรูปภาพ..." />}

      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
          <Dialog.Panel className="bg-white p-6 rounded w-full max-w-2xl max-h-screen overflow-y-auto">
            <Dialog.Title className="text-xl font-bold mb-4 text-black">แก้ไขข้อมูลร้านค้า</Dialog.Title>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
              <input {...register("name")} placeholder="ชื่อร้าน" className="input input-bordered w-full text-white" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

              <input {...register("description")} placeholder="คำอธิบาย" className="input input-bordered w-full text-white" />
              <input {...register("address")} placeholder="ที่อยู่" className="input input-bordered w-full text-white" />
              <input {...register("social_links")} placeholder="ลิงก์โซเชียล" className="input input-bordered w-full text-white" />

              <select {...register("category_id")} className="select select-bordered w-full text-white">
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}

              <p className="font-semibold text-black mb-1">รูปภาพเดิม:</p>
              <div className="grid grid-cols-5 gap-2">
                {storeImages.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt={`img-${index}`} className="w-20 h-20 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                      onClick={() => openDeleteModal(img)}
                    >ลบ</button>
                    <select
                      className="absolute bottom-0 left-0 text-xs p-1 bg-white text-black rounded"
                      value={img.order_number}
                      onChange={(e) => handleOrderChange(index, e.target.value)}
                    >
                      {[...Array(storeImages.length)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <p className="font-semibold text-black">เพิ่มรูปภาพใหม่ (สูงสุด 5):</p>
              {[...Array(5)].map((_, i) => (
                <input
                  key={i}
                  type="file"
                  {...register(`images_${i}`)}
                  accept="image/*"
                  className="file-input w-full text-white mb-2"
                  disabled={i < storeImages.length}
                />
              ))}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="btn btn-outline border-gray-300bg-yellow-400 text-black bg-yellow-500">ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={!isChanged || isSubmitting}>
                  บันทึก
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} className="relative z-[9999]">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded max-w-sm w-full shadow">
            <Dialog.Title className="text-lg font-semibold text-red-600">เกิดข้อผิดพลาด</Dialog.Title>
            <p className="mt-2 text-gray-800">{errorMessage}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="btn btn-outline border-gray-400 text-gray-700"
              >
                ปิด
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onClose={closeDeleteModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-semibold mb-4 text-gray-800 text-center">ยืนยันการลบรูปภาพ</Dialog.Title>
            <div className="flex flex-col items-center">
              {imageToDelete && (
                <img src={imageToDelete.image_url} alt="preview" className="w-32 h-32 object-cover rounded mb-4" />
              )}
              <p className="text-sm text-gray-700 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบรูปนี้?</p>
              <div className="flex justify-end gap-2 w-full">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-400 text-gray-800 rounded-md shadow-sm hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteImage}
                  className="btn btn-error text-white"
                  disabled={isDeleting}
                >
                  ลบ
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}