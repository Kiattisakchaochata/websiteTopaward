// src/components/PopularReviews.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import PopularReviewCard from "./PopularReviewCard";

const PopularReviews = () => {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularStores = async () => {
      try {
        const res = await axiosInstance.get("/stores/popular");
        setStores(res.data.stores || []);
      } catch (error) {
        console.error("Error fetching popular stores:", error);
      }
    };

    fetchPopularStores();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">รีวิวยอดนิยม</h2>
        <button
          className="text-yellow-400 font-semibold hover:underline"
          onClick={() => navigate("/popular-reviews")}
        >
          ดูทั้งหมด
        </button>
      </div>

      {stores.length > 3 ? (
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          grabCursor
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {stores.map((store) => (
            <SwiperSlide key={store.id}>
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/store/${store.id}`)}
              >
                <PopularReviewCard store={store} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="cursor-pointer"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <PopularReviewCard store={store} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularReviews;