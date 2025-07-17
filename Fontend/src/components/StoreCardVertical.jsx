const StoreCardVertical = ({ store }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 text-black">
      {/* 🔶 แสดง cover_image แบบสัดส่วนใกล้เคียงตัวอย่าง */}
      <div className="w-full aspect-[4/5]">
        <img
          src={store.cover_image || "/default-cover.jpg"}
          alt={store.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{store.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{store.description}</p>
      </div>
    </div>
  );
};

export default StoreCardVertical;