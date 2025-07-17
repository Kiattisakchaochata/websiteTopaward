// src/config/axiosInstance.js
import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "http://localhost:8877/api",
  withCredentials: true // ถ้า backend ใช้ cookie แต่ถ้าใช้ token ก็ไม่จำเป็น
})

// ✅ เพิ่ม interceptor เพื่อแนบ token ทุกครั้ง
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance