

const AddCategoryModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const token = useAuthStore((state) => state.token); // ✅ ดึง token ด้วย hook

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    try {
      // ✅ แนบ Authorization Header ที่นี่
      await axiosInstance.post(
        "/admin/categories",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("เพิ่มหมวดหมู่สำเร็จ");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ POST failed:", err);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg text-black">
        <h3 className="text-xl font-bold mb-4">เพิ่มหมวดหมู่ใหม่</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border px-4 py-2 rounded-md"
            placeholder="ชื่อหมวดหมู่"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;