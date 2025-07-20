import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  User,
  Layers,
  Store,
  Eye,
  AlertTriangle,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    stores: 0,
    totalVisitors: 0,
    storeVisitors: [],
  });

  const [expiringStores, setExpiringStores] = useState([]);
  const [expiredStores, setExpiredStores] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersRes,
          categoriesRes,
          storesRes,
          visitorRes,
          expiringRes,
          expiredRes,
        ] = await Promise.all([
          axiosInstance.get("/users"),
          axiosInstance.get("/categories"),
          axiosInstance.get("/stores"),
          axiosInstance.get("/visitor/stats"),
          axiosInstance.get("/admin/stores/expiring-soon"),
          axiosInstance.get("/admin/stores/expired"),
        ]);

        console.log("✅ Expiring:", expiringRes.data);
        console.log("✅ Expired:", expiredRes.data);

        setStats({
          users: usersRes.data.length,
          categories: categoriesRes.data.length,
          stores: storesRes.data.stores.length,
          totalVisitors: visitorRes.data.totalVisitors,
          storeVisitors: visitorRes.data.perStore,
        });

        setExpiringStores(expiringRes.data.stores); // <-- ตรวจดูว่าเป็น .stores จริงไหม
        setExpiredStores(expiredRes.data.stores);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล", {
  toastId: "load-error", // 💡 ใส่ ID ซ้ำกันจะไม่แสดงซ้ำ
});
      }
    };

    fetchStats();
  }, []);

  const handleReactivate = async (store) => {
  const { value: option } = await Swal.fire({
    title: `เลือกระยะเวลาต่ออายุร้าน ${store.name}`,
    input: 'select',
    inputOptions: {
      '365': '1 ปี',
      '730': '2 ปี',
      '1095': '3 ปี',
      'lifetime': 'ตลอดชีพ',
    },
    inputPlaceholder: 'เลือกระยะเวลา',
    showCancelButton: true,
    confirmButtonText: "ต่ออายุ",
    cancelButtonText: "ยกเลิก",
  });

  if (!option) return;

  try {
    let newExpiredDate;

    if (option === 'lifetime') {
      // ✅ ตั้งวันหมดอายุห่างไป 100 ปี
      newExpiredDate = new Date();
      newExpiredDate.setFullYear(newExpiredDate.getFullYear() + 100);
    } else {
      newExpiredDate = new Date();
      newExpiredDate.setDate(newExpiredDate.getDate() + parseInt(option));
    }

    const res = await axiosInstance.patch(
      `/admin/stores/${store.id}/reactivate`,
      { new_expired_at: newExpiredDate.toISOString() }
    );

    toast.success(res.data.message || "ต่ออายุร้านสำเร็จ");

    // เอาออกจาก list
    setExpiringStores((prev) => prev.filter((s) => s.id !== store.id));
    setExpiredStores((prev) => prev.filter((s) => s.id !== store.id));
  } catch (err) {
    console.error("Reactivate error:", err.response?.data || err.message);
    toast.error("ไม่สามารถต่ออายุร้านได้");
  }
};
const [loyaltyStats, setLoyaltyStats] = useState([]);

useEffect(() => {
  const fetchLoyaltyStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/stores/loyalty");
      setLoyaltyStats(res.data.stores);
    } catch (err) {
      console.error("Loyalty Stats Error:", err);
    }
  };

  fetchLoyaltyStats();
}, []);

  const cardData = [
    { title: "ผู้ใช้งาน", value: stats.users, icon: <User className="text-blue-500" size={28} /> },
    { title: "หมวดหมู่", value: stats.categories, icon: <Layers className="text-yellow-500" size={28} /> },
    { title: "ร้านทั้งหมด", value: stats.stores, icon: <Store className="text-green-500" size={28} /> },
    { title: "ผู้เข้าชมทั้งหมด", value: stats.totalVisitors, icon: <Eye className="text-purple-500" size={28} /> },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">แดชบอร์ดผู้ดูแลระบบ</h2>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cardData.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-full">{card.icon}</div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-gray-600">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ ร้านใกล้หมดอายุ */}
      {expiringStores.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow mb-10 border border-yellow-300">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-500" />
            <h3 className="text-xl font-semibold text-yellow-700">ร้านที่ใกล้หมดอายุ (30 วัน)</h3>
          </div>
          <table className="w-full text-left border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">ชื่อร้าน</th>
                <th className="p-3 border">หมวดหมู่</th>
                <th className="p-3 border">วันหมดอายุ</th>
                <th className="p-3 border text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {expiringStores.map((store) => (
                <tr key={store.id}>
                  <td className="p-3 border">{store.name}</td>
                  <td className="p-3 border">{store.category?.name}</td>
                  <td className="p-3 border">{new Date(store.expired_at).toLocaleDateString()}</td>
                  <td className="p-3 border text-center">
                    <button
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handleReactivate(store)}
                    >
                      ต่ออายุ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ ร้านที่หมดอายุแล้ว */}
      {expiredStores.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow mb-10 border border-gray-300">
          <h3 className="text-xl font-semibold mb-4 text-gray-600">ร้านที่หมดอายุแล้ว</h3>
          <table className="w-full text-left border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">ชื่อร้าน</th>
                <th className="p-3 border">หมวดหมู่</th>
                <th className="p-3 border">วันหมดอายุ</th>
                <th className="p-3 border text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {expiredStores.map((store) => (
                <tr key={store.id}>
                  <td className="p-3 border">{store.name}</td>
                  <td className="p-3 border">{store.category?.name}</td>
                  <td className="p-3 border">{new Date(store.expired_at).toLocaleDateString()}</td>
                  <td className="p-3 border text-center">
                    <button
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => handleReactivate(store)}
                    >
                      ต่ออายุ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ ผู้เข้าชมแต่ละร้าน */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">จำนวนผู้เข้าชมแต่ละร้าน</h3>
        <table className="w-full text-left border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ชื่อร้าน</th>
              <th className="p-3 border text-right">จำนวนผู้เข้าชม</th>
            </tr>
          </thead>
          <tbody>
            {stats.storeVisitors
              .filter((item) => item.store?.name) // ✅ กรองเฉพาะร้านที่มีชื่อ
              .map((item, index) => (
                <tr key={`visitor-${item.storeId || index}`}>
                  <td className="p-3 border">{item.store.name}</td>
                  <td className="p-3 border text-right">{item.total}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
{/* ✅ ข้อมูลความสัมพันธ์กับร้านค้า */}
{loyaltyStats.length > 0 && (
  <div className="bg-white p-6 rounded-xl shadow mt-10">
    <h3 className="text-xl font-semibold mb-4 text-gray-700">ข้อมูลความสัมพันธ์กับร้านค้า</h3>
    <table className="w-full text-left border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 border">ชื่อร้าน</th>
          <th className="p-3 border">วันที่สมัคร</th>
          <th className="p-3 border text-center">ต่ออายุแล้ว</th>
          <th className="p-3 border text-center">อยู่กับเรามาแล้ว</th>
        </tr>
      </thead>
      <tbody>
  {loyaltyStats.map((store) => (
    <tr key={store.id}>
      <td className="p-3 border">{store.name}</td>
      <td className="p-3 border">{new Date(store.created_at).toLocaleDateString()}</td>
      <td className="p-3 border text-center">{store.renewal_count} ครั้ง</td>
      <td className="p-3 border text-center">{Math.floor(store.years_with_us)} ปี</td>
      <td className="p-3 border text-center">
        {(() => {
          const years = store.years_with_us;
          const months = Math.round((store.years_with_us % 1) * 12);
          return `${Math.floor(years)} ปี${months > 0 ? ` ${months} เดือน` : ""}`;
        })()}
      </td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
)}
    </div>
  );
};

export default Dashboard;