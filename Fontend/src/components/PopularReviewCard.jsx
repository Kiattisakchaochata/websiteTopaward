// ✅ src/components/PopularReviewCard.jsx
const PopularReviewCard = ({ store }) => {
  if (!store || !store.reviews) return null;

  const averageRating =
    store.reviews.length > 0
      ? (
          store.reviews.reduce((sum, r) => sum + r.rating, 0) /
          store.reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="text-center bg-white text-black rounded-xl p-4 shadow hover:shadow-lg transition">
      <div className="bg-gray-200 h-40 rounded-xl mb-2 overflow-hidden">
        {store.images?.[0]?.image_url && (
          <img
            src={store.images[0].image_url}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <p className="font-medium truncate">{store.name}</p>
      <div className="flex items-center justify-center text-yellow-500 mt-1">
        ★★★★★ <span className="ml-2 text-sm text-black">{averageRating}</span>
      </div>
      <button className="bg-yellow-700 text-white px-4 py-1 rounded mt-2 text-sm">
        ดูรีวิว
      </button>
    </div>
  );
};

export default PopularReviewCard;


