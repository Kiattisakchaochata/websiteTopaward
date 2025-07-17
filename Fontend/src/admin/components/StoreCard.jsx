import React from "react";

const StoreCard = ({ store, onEdit, onDelete, onEditCover, onOrderChange, totalInCategory, onReactivate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md mx-auto">
      {/* Cover image */}
      {store.cover_image && (
        <img
          src={store.cover_image}
          alt="store cover"
          className="w-full h-48 object-cover"
        />
      )}

      <div className="px-4 py-2">
        {/* ชื่อร้าน */}
        <h2 className="text-xl font-bold text-black mb-2">{store.name}</h2>

        {/* Badge หมดอายุ */}
        {!store.is_active && (
          <div className="badge badge-error mb-2">หมดอายุแล้ว</div>
        )}

        {/* ปุ่มเปิดใช้งานใหม่ */}
        {!store.is_active && onReactivate && (
          <button
            onClick={onReactivate}
            className="btn btn-sm btn-warning w-full mt-2 bg-black-200"
          >
            เปิดใช้งานร้านอีกครั้ง
          </button>
        )}

        {/* รูปเพิ่มเติม */}
        <div className="flex gap-2 mb-3 mt-2">
          {store.images?.map((img, idx) => (
            <img
              key={idx}
              src={img.image_url}
              alt={`store-img-${idx}`}
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>

        {/* ลำดับร้าน */}
        <p className="text-sm text-gray-600 mb-3">ลำดับ: {store.order_number}</p>

        {/* เลือกเปลี่ยนลำดับ */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm text-gray-700">เปลี่ยนลำดับ:</label>
          <select
            className="select select-sm select-bordered text-white"
            value={store.order_number}
            onChange={(e) => onOrderChange(Number(e.target.value))}
          >
            {[...Array(totalInCategory)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        {/* ปุ่มแก้ไข/ลบ */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            onClick={onEdit}
            className="btn bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg shadow-md px-4 py-2 transition-all"
          >
            แก้ไข
          </button>

          <button
            onClick={onDelete}
            className="btn bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md px-4 py-2 transition-all"
          >
            ลบ
          </button>

          <button
            onClick={onEditCover}
            className="btn bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md px-4 py-2 transition-all"
          >
            แก้ไขหน้าปก
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;