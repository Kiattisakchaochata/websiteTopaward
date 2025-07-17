// components/StoreExpireInput.jsx
import React from "react";

const StoreExpireInput = ({ register }) => {
  return (
    <div>
      <label className="text-black">วันหมดอายุร้าน:</label>
      <input
        type="date"
        {...register("expired_at")}
        className="input input-bordered w-full bg-black text-white"
      />
    </div>
  );
};

export default StoreExpireInput;