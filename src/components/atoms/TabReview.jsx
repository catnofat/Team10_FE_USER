import React, { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { carwashesReviews } from "../../apis/carwashes";
import ReviewList from "../molecules/ReviewList";
import KeywordReview from "./KeywordReview";
import UserStar from "./UserStar";

const TabReview = ({ carwashId }) => {
  const averageStar = 4.5; // 이 값은 예시일 수 있으며 실제 평균 별점 계산 로직이 필요할 수 있습니다.

  const { data: reviewsData } = useSuspenseQuery({
    queryKey: ["carwashesReviews", carwashId],
    queryFn: () => carwashesReviews(carwashId),
  });

  const carwashreviews = reviewsData?.data?.response?.reviews?.map(
    (review) => ({
      rating: review.rate,
      username: review.username,
      date: review.created_at.split("T")[0],
      content: review.comment,
    })
  );

  // KeywordReview와 관련된 데이터 처리 로직
  // ...

  return (
    <Suspense fallback={<div>Loading reviews...</div>}>
      <div>
        <div className="grid gap-2">
          <div className="font-semibold">평균별점</div>
          <div>
            <UserStar averageStar={averageStar} />
          </div>
          <hr />
          <div className="font-semibold">키워드 리뷰</div>
          <div className="grid gap-2">
            {/* KeywordReview 컴포넌트 렌더링 */}
          </div>
          <hr />
          <div className="font-semibold">
            리뷰 {carwashreviews?.length || 0}건
          </div>
          <ReviewList reviews={carwashreviews} />
        </div>
      </div>
    </Suspense>
  );
};

export default TabReview;
