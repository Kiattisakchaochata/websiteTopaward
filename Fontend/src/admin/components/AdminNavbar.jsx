import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>

      <div className="space-x-4 flex items-center">
        <Link to="/admin/dashboard" className="hover:underline font-medium">
          Dashboard
        </Link>
        <Link to="/admin/categories" className="hover:underline font-medium">
          หมวดหมู่
        </Link>
        <Link to="/admin/stores" className="hover:underline font-medium">
          ร้านค้า
        </Link>
        {/* ✅ เพิ่มเมนู "แบนเนอร์" */}
        <Link to="/admin/banners" className="hover:underline font-medium">
          แบนเนอร์
        </Link>

        <button
          onClick={handleLogout}
          className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
        >
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;