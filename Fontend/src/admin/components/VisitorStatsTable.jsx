const VisitorStatsTable = ({ visitorStats }) => {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2">จำนวนผู้เข้าชมแต่ละร้าน</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">ชื่อร้าน</th>
              <th className="py-2 px-4">จำนวนผู้เข้าชม</th>
            </tr>
          </thead>
          <tbody>
            {visitorStats.map((v, index) => (
              <tr key={`visitor-${index}`}>
                <td className="py-2 px-4">{v.store?.name || "-"}</td>
                <td className="py-2 px-4">{v.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitorStatsTable;