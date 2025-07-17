import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";

const CategoryDetailPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  if (!id) {
    console.warn("❌ ไม่มี id จาก param");
    setError("ไม่พบหมวดหมู่ที่ต้องการ");
    return;
  }

  const fetchData = async () => {
    try {
      const categoryRes = await axiosInstance.get(`/categories/${id}`);
      setCategory(categoryRes.data);

      const storeRes = await axiosInstance.get("/stores");
      const filtered = storeRes.data.stores.filter(
        (s) => String(s.category_id) === String(id) && s.is_active
      );
      setStores(filtered);
    } catch (err) {
      console.error("❌ ไม่พบหมวดหมู่:", id, err);
      setError("ไม่พบหมวดหมู่ที่ต้องการ");
    }
  };

  fetchData();
}, [id]);

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error} —{" "}
        <button className="underline" onClick={() => navigate("/")}>
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  if (!category) {
    return <div className="p-6">กำลังโหลดข้อมูลหมวดหมู่...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">{category.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            onClick={() => navigate(`/store/${store.id}`)}
            className="cursor-pointer bg-white text-black rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
          >
            <div className="w-full aspect-[4/5]">
              <img
                src={store.cover_image || "/default-cover.jpg"}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-1 line-clamp-1">
                {store.name}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">
                {store.description || "ไม่มีคำอธิบาย"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDetailPage;