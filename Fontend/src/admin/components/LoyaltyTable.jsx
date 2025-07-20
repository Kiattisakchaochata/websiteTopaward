import React, { useEffect, useState } from "react";
import axios from "axios";

const LoyaltyTable = () => {
  const [loyaltyStats, setLoyaltyStats] = useState([]);

  useEffect(() => {
    const fetchLoyaltyStats = async () => {
      try {
        const res = await axios.get("/api/admin/stores/loyalty");
        setLoyaltyStats(res.data.stores);
      } catch (err) {
        console.error("Loyalty Stats Error:", err);
      }
    };

    fetchLoyaltyStats();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">ข้อมูลความภักดีของลูกค้า (Loyalty Stats)</h2>
      <table className="table w-full">
        <thead>
          <tr className="bg-gray-100">
            <th>#</th>
            <th>ชื่อร้าน</th>
            <th>วันที่เริ่มใช้</th>
            <th>จำนวนครั้งที่ต่ออายุ</th>
            <th>อยู่กับเรามากี่ปี</th>
          </tr>
        </thead>
        <tbody>
          {loyaltyStats.map((store, index) => (
            <tr key={store.id}>
              <td>{index + 1}</td>
              <td>{store.name}</td>
              <td>{new Date(store.created_at).toLocaleDateString("th-TH")}</td>
              <td>{store.renewal_count} ครั้ง</td>
              <td>{store.years_with_us} ปี</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoyaltyTable;