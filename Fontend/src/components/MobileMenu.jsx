// src/components/MobileMenu.jsx
import { Link, useLocation } from "react-router-dom"
import { HiX } from "react-icons/hi"
import { FaSearch } from "react-icons/fa"

function MobileMenu({ open, onClose, user, logout, searchText, setSearchText, handleSearch }) {
  const location = useLocation()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md">
      <div className="bg-[#fdfcf9] rounded-b-xl shadow-md pb-10">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-300">
          <span className="text-xl font-bold text-yellow-900">เมนู</span>
          <button onClick={onClose} className="text-yellow-900">
            <HiX size={28} />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="px-5 mt-4 relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="ค้นหาร้าน / คลินิก / ที่เที่ยว"
            className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm text-black placeholder-gray-500 bg-white"
          />
          <button type="submit" className="absolute right-7 top-2.5 text-yellow-900">
            <FaSearch size={16} />
          </button>
        </form>

        {/* Navigation */}
        <nav className="mt-6 px-6 flex flex-col gap-4 text-yellow-900 text-[17px] font-medium">
          <Link
            to="/"
            onClick={onClose}
            className={`${location.pathname === "/" ? "underline font-bold" : ""} hover:opacity-80`}
          >
            หน้าหลัก
          </Link>
          <Link
            to="/category"
            onClick={onClose}
            className={`${location.pathname.startsWith("/category") ? "underline font-bold" : ""} hover:opacity-80`}
          >
            หมวดหมู่
          </Link>

          {!user ? (
            <>
              <Link
                to="/register"
                onClick={onClose}
                className={`${location.pathname === "/register" ? "underline font-bold" : ""} hover:opacity-80`}
              >
                สมัครสมาชิก
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                className="hover:opacity-80"
              >
                เข้าสู่ระบบ
              </Link>
            </>
          ) : (
            <>
              <span className="text-yellow-900">{user.name}</span>
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="bg-yellow-800 text-white px-4 py-2 rounded-full hover:bg-yellow-900 mt-2"
              >
                ออกจากระบบ
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}

export default MobileMenu