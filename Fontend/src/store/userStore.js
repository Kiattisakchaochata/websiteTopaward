import { create } from "zustand"
import { jwtDecode } from "jwt-decode"

const useUserStore = create((set) => ({
  user: null,

  // ✅ ฟังก์ชัน login → set user
  setUser: (user) => set({ user }),

  // ✅ logout
  logout: () => {
    localStorage.removeItem("token")
    set({ user: null })
  },

  // ✅ ฟังก์ชันนี้จะใช้ตอนรีเฟรช
  restoreUserFromToken: () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        set({ user: decoded })
      } catch (err) {
        console.error("Token ไม่ถูกต้อง", err)
        localStorage.removeItem("token")
        set({ user: null })
      }
    }
  }
}))

export default useUserStore