// ✅ CategoryTable.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";

const CategoryTable = () => {
  const token = useAuthStore((state) => state.token);
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(res.data.categories);
    } catch (err) {
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="overflow-x-auto mt-6">
      <table className="table table-zebra w-full bg-white text-black rounded-xl shadow-md min-w-[600px]">
        <thead className="bg-base-200">
          <tr>
            <th>#</th>
            <th>ชื่อหมวดหมู่</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={cat.id}>
              <td>{index + 1}</td>
              <td>{cat.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;