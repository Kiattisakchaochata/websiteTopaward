import { useNavigate } from "react-router-dom";

const StoreCardHorizontal = ({ store }) => {
  const navigate = useNavigate();

  // ✅ ป้องกัน error: reviews อาจ undefined
  const reviews = Array.isArray(store?.reviews) ? store.reviews : [];

  const rating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "ยังไม่มีรีวิว";

  return (
    <div
      onClick={() => navigate(`/store/${store.id}`)}
      className="flex bg-white text-black rounded-xl shadow-md overflow-hidden cursor-pointer hover:opacity-90 h-full min-h-[200px]"
    >
      <div className="aspect-[4/3] w-[45%] min-w-[160px] max-w-[200px] overflow-hidden">
        <img
          src={store.images?.[0]?.image_url || "/no-image.jpg"}
          alt={store.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <h3 className="text-lg font-bold mb-1">{store.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {store.description || "ไม่มีรายละเอียด"}
          </p>
        </div>
        <div className="text-yellow-500 text-sm mt-2">⭐ {rating}</div>
      </div>
    </div>
  );
};

export default StoreCardHorizontal;