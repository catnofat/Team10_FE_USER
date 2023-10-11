import React, { useEffect, useState } from "react";

const KeywordReview = ({ keyword, reviewCount, totalReviews }) => {
  const [fillPercentage, setFillPercentage] = useState(0);

  useEffect(() => {
    const calculatedFillPercentage = (reviewCount / totalReviews) * 100;
    setFillPercentage(calculatedFillPercentage);
  }, [reviewCount, totalReviews]);

  return (
    <div className="my-2">
      <div className="flex items-center">
        <div className="w-full p-2 bg-gray-200 text-gray-700 rounded-lg relative flex justify-between items-center">
          <div className="text-black font-semibold">
            {keyword}
          </div>
          <div className="text-sky-500 font-semibold">
            {reviewCount}
          </div>
          <div className="h-full absolute left-0 top-0 rounded-lg" style={{ width: `${fillPercentage}%`, backgroundColor: "rgba(14, 165, 233, 0.3)" }}></div>
        </div>
      </div>
    </div>
  );
};

export default KeywordReview;