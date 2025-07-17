import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";

import CategoryCard from "../components/CategoryCard";
import StoreCardHorizontal from "../components/StoreCardHorizontal";
import PopularReviews from "../components/PopularReviews";

const bannerImages = [
  { url: "/banners/banner1_spa.png", alt: "คลินิกความงาม" },
  { url: "/banners/travel.png", alt: "ท่องเที่ยว" },
  { url: "/banners/banner3_travel.png", alt: "ท่องเที่ยวอื่นๆ" },
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [latestStores, setLatestStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.post("/visitor/visit/website").catch(console.error);

    const fetchData = async () => {
      try {
        const categoryRes = await axiosInstance.get("/categories");
        const storeRes = await axiosInstance.get("/stores");
        console.log("📦 ร้านทั้งหมดที่โหลดมา:", storeRes.data.stores);
      console.log(
        "✅ ร้านที่ active อยู่:",storeRes.data.stores.filter((s) => s.is_active)
      );
        const realCategories = categoryRes.data.filter((c) => c.id && c.name);

        // ✅ กรองร้านที่ is_active === true เท่านั้น
        const storesWithValidId = storeRes.data.stores
          .filter((s) => s.id)
          .filter((s) => s.is_active); // 👈 แสดงเฉพาะร้านที่ยังเปิดอยู่

        const sortedByDate = [...storesWithValidId]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4);
console.log("✅ ร้านล่าสุดที่จะโชว์:", sortedByDate);
        setCategories(realCategories);
        setLatestStores(sortedByDate);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen text-white bg-[#0f172a] pb-20">
      {/* 🔶 แบนเนอร์ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Swiper
          autoplay={{ delay: 8000 }}
          loop
          effect="fade"
          speed={1200}
          modules={[Autoplay, EffectFade]}
          fadeEffect={{ crossFade: true }}
        >
          {bannerImages.map((image, idx) => (
            <SwiperSlide key={idx}>
              <div className="overflow-hidden aspect-[3/1] w-full rounded-2xl">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 🔶 หมวดหมู่ */}
      <div className="max-w-6xl mx-auto px-4 py-8">
  <h2 className="text-2xl font-bold mb-6">หมวดหมู่</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {categories
      .filter((cat) => !!cat?.id) // ✅ ป้องกัน cat.id undefined
      .map((cat) => (
        <div
          key={cat.id}
          className="cursor-pointer"
          onClick={() => navigate(`/category/${cat.id}`)} // ✅ ปลอดภัยเพราะ filter แล้ว
        >
          <CategoryCard cat={cat} />
        </div>
      ))}
  </div>
</div>

      {/* 🔶 รีวิวยอดนิยม */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-2">
        <PopularReviews />
      </div>

      {/* 🔶 รีวิวล่าสุด */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <h2 className="text-2xl font-bold mb-4">รีวิวล่าสุด</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {latestStores.map((store) => (
            <div
              key={store.id}
              className="cursor-pointer"
              onClick={() => navigate(`/store/${store.id}`)}
            >
              <StoreCardHorizontal store={store} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;