import { useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import Swal from "sweetalert2";
import LoaderSpinner from "../../components/LoaderSpinner";

const CoverImageModal = ({ isOpen, onClose, store, onSuccess }) => {
    const [coverFile, setCoverFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        setCoverFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coverFile) {
            Swal.fire("กรุณาเลือกไฟล์ภาพก่อน", "", "warning");
            return;
        }

        const formData = new FormData();
        formData.append("cover", coverFile);

        try {
            setIsSubmitting(true);
            const res = await axiosInstance.patch(`/admin/stores/cover/${store.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            }
            );
            Swal.fire("สำเร็จ", res.data.message || "อัปเดตหน้าปกแล้ว", "success");
            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire("ผิดพลาด", err.response?.data?.message || "อัปเดตไม่สำเร็จ", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ ซ่อน modal ถ้า isOpen เป็น false
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex justify-center items-center px-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
                {isSubmitting && <LoaderSpinner text="กำลังอัปโหลดหน้าปก..." />}
                <h2 className="text-xl font-bold mb-4 text-black">แก้ไขภาพหน้าปกร้านค้า</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-black font-semibold block mb-1">เลือกรูปภาพใหม่:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input w-full text-white bg-gray-900"
                        />
                    </div>
                    {store.cover_image && (
                        <div>
                            <label className="text-black font-semibold block mb-1">หน้าปกเดิม:</label>
                            <img
                                src={store.cover_image}
                                alt="current cover"
                                className="w-[200px] h-[200px] object-cover rounded shadow"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !coverFile}
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CoverImageModal;