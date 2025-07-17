import { create } from "zustand"
import { persist } from "zustand/middleware"
import { jwtDecode } from "jwt-decode"

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,

      // login: บันทึก token และ decode user
      login: (token) => {
        localStorage.setItem("token", token)
        const decoded = jwtDecode(token)
        set({ user: decoded })
      },

      // logout
      logout: () => {
        localStorage.removeItem("token")
        set({ user: null })
      },

      // เรียกตอนแอปโหลด/รีเฟรช เพื่อ restore user จาก token
      restoreUser: () => {
        const token = localStorage.getItem("token")
        if (token) {
          try {
            const decoded = jwtDecode(token)
            set({ user: decoded })
          } catch (err) {
            console.error("token ไม่ถูกต้อง", err)
            localStorage.removeItem("token")
            set({ user: null })
          }
        }
      }
    }),
    {
      name: "auth-storage", // จะเก็บ user persist ใน localStorage
    }
  )
)

export default useAuthStore