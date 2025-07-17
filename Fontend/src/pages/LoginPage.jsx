import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axiosInstance from "../config/axiosInstance";

const schema = yup.object().shape({
  email: yup.string().email("รูปแบบอีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
  password: yup.string().required("กรุณากรอกรหัสผ่าน"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore(); // ✅ เรียก login จาก zustand

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);

    login(res.data.token, res.data.user); // บันทึก token + user

    Swal.fire({
      icon: "success",
      title: "เข้าสู่ระบบสำเร็จ",
      text: "ยินดีต้อนรับ!",
      timer: 2000,
      showConfirmButton: false,
    });

    // ✅ ตรวจสอบ role เพื่อ redirect ไปหน้าให้ถูกต้อง
    if (res.data.user.role === "ADMIN") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบล้มเหลว",
      text: err.response?.data?.message || "เกิดข้อผิดพลาด",
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center  text-white">
      <div className="bg-white text-black w-full max-w-md p-10 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-800">
          เข้าสู่ระบบ
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">อีเมล</label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-2 rounded-md border border-gray-300"
            />
            <p className="text-red-500 text-sm">{errors.email?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">รหัสผ่าน</label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-2 rounded-md border border-gray-300"
            />
            <p className="text-red-500 text-sm">{errors.password?.message}</p>
          </div>

          <button
            type="submit"
            className="bg-yellow-700 hover:bg-yellow-800 text-white w-full py-2 rounded-lg"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;