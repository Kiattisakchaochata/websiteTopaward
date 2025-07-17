import { useNavigate } from "react-router-dom";

const CategoryCard = ({ cat }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/category/${cat.id}`)} // ✅ ไปยังหน้ารายละเอียด
      className="bg-white rounded-xl p-4 text-black shadow cursor-pointer hover:opacity-90"
    >
      <img
        src={cat.cover_image}
        alt={cat.name}
        className="w-full h-32 object-cover rounded mb-2"
      />
      <h3 className="font-bold">{cat.name}</h3>
    </div>
  );
};

export default CategoryCard;