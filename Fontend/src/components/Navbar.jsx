import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaSearch, FaBars } from "react-icons/fa"
import { useState } from "react"
import useAuthStore from "../store/authStore"
import MobileMenu from "./MobileMenu"

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchText, setSearchText] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText.trim())}`)
      setSearchText("")
    }
  }

  return (
    <div className="bg-[#F5EEDC] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* โลโก้ */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/LogoTopAward.png" alt="TopAward" className="w-30 h-30" />
          <span className="font-bold text-xl text-yellow-800">TopAward</span>
        </Link>

        {/* ค้นหา */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 mx-6 relative"
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="ค้นหาร้าน / คลินิก / ที่เที่ยว"
            className="input input-bordered bg-white text-black placeholder-gray-500 w-full rounded-full pr-10"
          />
          <button type="submit" className="absolute right-3 top-3 text-yellow-900">
            <FaSearch />
          </button>
        </form>

        {/* Desktop เมนู */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/"
            className={`text-lg ${
              location.pathname === "/"
                ? "font-bold underline text-yellow-900"
                : "text-yellow-900 hover:underline"
            }`}
          >
            หน้าหลัก
          </Link>
          <Link
            to="/category"
            className={`text-lg ${
              location.pathname.startsWith("/category")
                ? "font-bold underline text-yellow-900"
                : "text-yellow-900 hover:underline"
            }`}
          >
            หมวดหมู่
          </Link>

          {user ? (
            <>
              <span className="text-yellow-900 font-semibold">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-yellow-800 text-white px-4 py-1 rounded-lg hover:bg-yellow-900"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className={`text-yellow-900 hover:underline text-lg ${
                  location.pathname === "/register" ? "font-bold underline" : ""
                }`}
              >
                สมัครสมาชิก
              </Link>
              <Link
                to="/login"
                className="bg-yellow-800 text-white px-4 py-1 rounded-lg hover:bg-yellow-900"
              >
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            className="text-yellow-900"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <FaBars size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        logout={handleLogout}
        searchText={searchText}
        setSearchText={setSearchText}
        handleSearch={handleSearch}
      />
    </div>
  )
}

export default Navbar