// src/admin/layouts/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-black">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h1 className="font-bold text-xl text-center sm:text-left">Admin Panel</h1>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "hover:text-blue-500 transition"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "hover:text-blue-500 transition"
            }
          >
            หมวดหมู่
          </NavLink>
          <NavLink
            to="/admin/stores"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "hover:text-blue-500 transition"
            }
          >
            ร้านค้า
          </NavLink>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded w-full sm:w-auto"
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* Outlet แสดงแต่ละหน้าที่อยู่ใน Admin */}
      <main className="p-4 sm:p-6 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;