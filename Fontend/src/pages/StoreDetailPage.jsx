import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import ReviewForm from "../components/ReviewForm";
import ReviewCard from "../components/ReviewCard";
import { jwtDecode } from "jwt-decode";

const StoreDetailPage = () => {
  const { id: storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userInfo, setUserInfo] = useState({ id: null, role: null, ready: false });

  // ✅ Decode token เพื่อดึง user id และ role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo({ id: decoded.id, role: decoded.role, ready: true });
      } catch (err) {
        console.error("ไม่สามารถ decode token ได้:", err);
        setUserInfo({ id: null, role: null, ready: true });
      }
    } else {
      setUserInfo({ id: null, role: null, ready: true }); // guest
    }
  }, []);

  // ✅ โหลดข้อมูลร้านและรีวิว
  useEffect(() => {
    if (!userInfo.ready) return;

    const fetchData = async () => {
      try {
        const storeRes = await axiosInstance.get(`/stores/${storeId}`);
        const storeData = storeRes.data;

        // ✅ เช็คว่า active หรือไม่
        if (!storeData.is_active) {
          return navigate("/not-found");
        }

        setStore(storeData);

        const reviewsRes = await axiosInstance.get(`/reviews/stores/${storeId}/reviews`);
        setReviews(reviewsRes.data.reviews);

        const avg =
          reviewsRes.data.reviews.length > 0
            ? reviewsRes.data.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reviewsRes.data.reviews.length
            : 0;

        setAverageRating(avg);
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
        navigate("/not-found");
      }
    };

    fetchData();
  }, [storeId, userInfo.ready, navigate]);

  // ✅ นับจำนวนผู้เข้าชม
  useEffect(() => {
    axiosInstance.post(`/visitor/visit/store/${storeId}`).catch((err) => {
      console.error("นับผู้เข้าชมล้มเหลว:", err);
    });
  }, [storeId]);

  if (!store) return <div className="text-white p-4">กำลังโหลดร้านค้า...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 py-10 max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">{store.name}</h1>
      <p className="text-gray-300">{store.description || "ไม่มีคำอธิบาย"}</p>

      {/* ✅ แสดงรูปร้าน */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {store.images?.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            alt={img.alt_text}
            className="w-full rounded-lg object-cover aspect-square"
          />
        ))}
      </div>

      {/* ✅ ฟอร์มรีวิว หรือแจ้งให้ login/register */}
{userInfo.ready && (
  userInfo.id ? (
    <ReviewForm
      storeId={storeId}
      onSuccess={() => window.location.reload()}
      averageRating={averageRating}
    />
  ) : (
    <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-6 text-sm">
      กรุณา{" "}
      <a
        href="/login"
        className="underline text-blue-600 hover:text-blue-800 font-medium"
      >
        เข้าสู่ระบบ
      </a>{" "}
      หรือ{" "}
      <a
        href="/register"
        className="underline text-blue-600 hover:text-blue-800 font-medium"
      >
        สมัครสมาชิก
      </a>{" "}
      เพื่อแสดงความคิดเห็นหรือให้คะแนนร้านนี้
    </div>
  )
)}

      {/* ✅ รายการรีวิว */}
      <div>
        <h2 className="text-2xl font-bold mt-10 mb-4">รีวิวทั้งหมด</h2>
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={userInfo.id}
                onUpdate={() => window.location.reload()}
              />
            ))
          ) : (
            <div className="text-gray-400">ยังไม่มีรีวิว</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetailPage;