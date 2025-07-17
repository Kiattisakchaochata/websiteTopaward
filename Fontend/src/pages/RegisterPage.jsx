import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../config/axiosInstance";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  name: yup.string().required("กรุณากรอกชื่อ"),
  email: yup.string().email("อีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
  password: yup.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").required("กรุณากรอกรหัสผ่าน"),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post("/auth/register", data);
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
        text: "กำลังพาไปหน้าล็อกอิน...",
        timer: 2000,
        showConfirmButton: false,
      });
      setTimeout(() => {
        navigate("/login"); // หรือเปลี่ยนเป็น "/"
      }, 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "สมัครไม่สำเร็จ",
        text: err?.response?.data?.message || "มีบางอย่างผิดพลาด",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1f232c]">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-10 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#966F33]">สมัครสมาชิก</h2>

        <label className="block text-gray-700">ชื่อ</label>
        <input {...register("name")} className="input input-bordered w-full mb-2" />
        <p className="text-red-500 text-sm mb-2">{errors.name?.message}</p>

        <label className="block text-gray-700">อีเมล</label>
        <input {...register("email")} className="input input-bordered w-full mb-2" />
        <p className="text-red-500 text-sm mb-2">{errors.email?.message}</p>

        <label className="block text-gray-700">รหัสผ่าน</label>
        <input type="password" {...register("password")} className="input input-bordered w-full mb-2" />
        <p className="text-red-500 text-sm mb-4">{errors.password?.message}</p>

        <button type="submit" className="btn w-full bg-[#966F33] text-white hover:bg-[#7b5c28]">
          สมัครสมาชิก
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;