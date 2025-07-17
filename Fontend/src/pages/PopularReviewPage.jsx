import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import PopularReviewCard from "../components/PopularReviewCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";

const PopularReviews = () => {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularStores = async () => {
      try {
        const res = await axiosInstance.get("/stores/popular");
        setStores(res.data.stores || []);
      } catch (err) {
        console.error("error fetching popular stores:", err);
      }
    };

    fetchPopularStores();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">รีวิวยอดนิยม</h2>
        <button
          className="text-yellow-400 font-semibold hover:underline"
          onClick={() => navigate("/popular")}
        >
          ดูทั้งหมด
        </button>
      </div>

      {/* ✅ ใส่ -mx-2 ที่ Swiper และ px-2 ที่ SwiperSlide เพื่อให้ชิดเท่า category */}
      <Swiper
        modules={[Navigation]}
        slidesPerView={1}
        spaceBetween={16}
        navigation
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="-mx-2"
      >
        {stores.map((store) => (
          <SwiperSlide key={store.id} className="px-2">
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <PopularReviewCard store={store} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PopularReviews;