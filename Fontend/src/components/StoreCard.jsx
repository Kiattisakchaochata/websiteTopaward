import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const StoreCard = ({ store }) => {
  const navigate = useNavigate();

  const rating =
    store.reviews.length > 0
      ? (
          store.reviews.reduce((sum, r) => sum + r.rating, 0) /
          store.reviews.length
        ).toFixed(1)
      : "ยังไม่มีรีวิว";

  return (
    <div
      onClick={() => navigate(`/store/${store.id}`)}
      className="bg-white text-black rounded-xl shadow-md overflow-hidden cursor-pointer hover:opacity-90 flex flex-col h-full"
    >
      {/* ✅ ภาพหน้าร้านแบบเท่ากันทุกใบ */}
      <div className="w-full aspect-[4/3] overflow-hidden">
        {store.images?.length > 0 ? (
          <Swiper className="w-full h-full">
            {store.images.map((img) => (
              <SwiperSlide key={img.id}>
                <div className="w-full h-full">
                  <img
                    src={img.image_url}
                    alt={img.alt_text || store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src="/no-image.jpg"
            alt="ไม่มีรูป"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* ✅ เนื้อหาและเรตติ้ง */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div className="mb-2">
          <h3 className="text-lg font-bold mb-1">{store.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {store.description || "ไม่มีรายละเอียด"}
          </p>
        </div>
        <div className="text-yellow-500 text-sm mt-auto">⭐ {rating}</div>
      </div>
    </div>
  );
};

export default StoreCard;