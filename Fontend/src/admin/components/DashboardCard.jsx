const colorMap = {
  blue: "text-blue-600",
  green: "text-green-600",
  purple: "text-purple-600",
  yellow: "text-yellow-600",
  red: "text-red-600",
};

const DashboardCard = ({ title, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className={`text-3xl mt-2 ${colorMap[color] || "text-gray-800"}`}>{value}</p>
    </div>
  );
};

export default DashboardCard;