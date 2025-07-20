import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import LoaderSpinner from "../../components/LoaderSpinner";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [altText, setAltText] = useState("");
  const [order, setOrder] = useState(0);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const res = await axiosInstance.get("/admin/banners");
      setBanners(res.data.banners);
    } catch (err) {
      toast.error("ไม่สามารถโหลดแบนเนอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("กรุณาเลือกรูปภาพ");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("alt_text", altText);
    formData.append("order", order);

    try {
      const res = await axiosInstance.post("/admin/banners", formData);
      toast.success("เพิ่มแบนเนอร์สำเร็จ");
      setAltText("");
      setOrder(0);
      setImage(null);
      fetchBanners();
    } catch (err) {
      toast.error("อัปโหลดไม่สำเร็จ");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "ลบแบนเนอร์?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบแบนเนอร์นี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosInstance.delete(`/admin/banners/${id}`);
        toast.success("ลบแบนเนอร์เรียบร้อยแล้ว");
        fetchBanners();
      } catch (err) {
        toast.error("ไม่สามารถลบแบนเนอร์ได้");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">จัดการแบนเนอร์</h2>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl shadow mb-10 space-y-4">
        <div>
          <label className="block font-medium">ข้อความแสดงแทน (alt text)</label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">ลำดับการแสดง (order)</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">เลือกรูปภาพ</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          อัปโหลดแบนเนอร์
        </button>
      </form>

      {loading ? (
        <LoaderSpinner />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white p-4 rounded-xl shadow border">
              <img src={banner.image_url} alt={banner.alt_text} className="w-full h-40 object-cover rounded mb-3" />
              <p><strong>Alt:</strong> {banner.alt_text}</p>
              <p><strong>Order:</strong> {banner.order}</p>
              <button
                onClick={() => handleDelete(banner.id)}
                className="mt-3 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
              >
                ลบแบนเนอร์
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerPage;