import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import CategoryCard from "../components/CategoryCard"; // ✅ เพิ่มถ้าใช้

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data.categories || res.data); // แล้วแต่ backend ส่ง array ไหน
      } catch (err) {
        console.error("❌ โหลดหมวดหมู่ไม่สำเร็จ:", err);
        setError("ไม่สามารถโหลดหมวดหมู่ได้");
      }
    };

    fetchCategories();
  }, []);

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <h2 className="text-2xl font-bold mb-6">หมวดหมู่ทั้งหมด</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories
          .filter((cat) => !!cat?.id)
          .map((cat) => (
            <div
              key={cat.id}
              className="cursor-pointer"
              onClick={() => navigate(`/category/${cat.id}`)}
            >
              <CategoryCard cat={cat} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default CategoryListPage;