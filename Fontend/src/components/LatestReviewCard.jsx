const LatestReviewCard = ({ storeName, reviewText }) => (
  <div className="flex gap-4">
    <div className="w-40 h-28 bg-gray-300 rounded-xl"></div>
    <div>
      <p className="font-semibold">{storeName}</p>
      <p className="text-sm text-gray-700">{reviewText}</p>
    </div>
  </div>
);