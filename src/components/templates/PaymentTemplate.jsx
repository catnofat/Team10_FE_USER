import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { calculatePayment } from "../../apis/carwashes";
import { pgpayment } from "../../apis/payment";
import dayjs from "dayjs";
import { Button } from "../atoms/Button";
import CustomModal from "../atoms/CustomModal";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const PaymentTemplate = () => {
  const [paymentData, setPaymentData] = useState({ price: undefined });
  const [redirectLink, setRedirectLink] = useState(null);
  const reservations = useSelector((state) => state.reservations);
  const carwashId = useSelector((state) => state.selectedCarwashId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bayId = useSelector((state) => state.selectedBayId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    mutate: paymentCalMutate, //결제 금액 계산
    isLoading: paymentCalIsLoading,
    isError: paymentCalIsError,
    error: paymentCalError,
  } = useMutation({
    mutationFn: (data) => calculatePayment(bayId, data),
    onSuccess: (data) => {
      setPaymentData({ price: data.data.response.price });
      console.log("결제금액 계산 성공:", data.data.response.price);
    },
    onError: (err) => {
      console.error("결제금액 계산 error:", err);
    },
  });

  const {
    mutate: payMutate, // pg 결제 로직
    isLoading: payIsLoading,
    isError: payIsError,
    error: payError,
  } = useMutation({
    mutationFn: (data) => pgpayment(bayId, data),
    onSuccess: (data) => {
      console.log("data", data);
      dispatch({ type: "SAVE_TID", payload: data?.data?.response?.tid });
      const isMobile = window.matchMedia(
        "only screen and (max-width: 600px)"
      ).matches;
      if (isMobile) {
        // 모바일 환경일 때
        setRedirectLink(data?.data?.response?.next_redirect_mobile_url);
      } else {
        // PC 환경일 때
        setRedirectLink(data?.data?.response?.next_redirect_pc_url);
      }
      // 이제 setRedirectLink를 사용하여 리다이렉트 URL을 상태로 설정합니다.
    },
    onError: (err) => {
      console.error("Payment error:", err);
    },
  });
  useEffect(() => {
    if (redirectLink) {
      // redirectLink가 설정되면, 네비게이트를 사용하여 리디렉션합니다.
      window.location.href = redirectLink;
    }
  }, [redirectLink]);

  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  const handlePayment = () => {
    if (!bayId || !reservations.startTime || !reservations.endTime) {
      setIsModalOpen(true);
      return;
    }
    const paypostData = {
      requestDto: {
        cid: "TC0ONETIME",
        partner_order_id: "partner_order_id",
        partner_user_id: "partner_user_id",
        item_name: "구름 세차장 예약",
        quantity: 1,
        total_amount: paymentData?.price,
        tax_free_amount: 0,
      },
      saveDTO: {
        startTime: reservations.startTime, // 전역 상태에서 startTime 가져오기
        endTime: reservations.endTime, // 전역 상태에서 endTime 가져오기
      },
    };
    if (carwashId) {
      payMutate(paypostData);
    }
  };

  useEffect(() => {
    if (reservations && carwashId) {
      paymentCalMutate(reservations);
    }
  }, [reservations, carwashId, paymentCalMutate]);

  // UI 로딩 상태 표시
  if (paymentCalIsLoading) {
    return <div>Loading...</div>;
  }

  // UI 에러 상태 표시
  if (paymentCalIsLoading) {
    return <div>Error: {paymentCalError.message}</div>;
  }

  const formatDateStart = (dateString) => {
    const datePart = dayjs(dateString).format("YYYY년 MM월 DD일");
    const timePart = dayjs(dateString).format("HH시 mm분");
    return { datePart, timePart };
  };

  const formatDateEnd = (dateString) => {
    return dayjs(dateString).format("HH시 mm분");
  };

  const calculateDuration = (start, end) => {
    const duration = dayjs(end).diff(dayjs(start), "minute");
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}시간` + (minutes > 0 ? ` ${minutes}분` : "");
  };

  const { datePart, timePart } = formatDateStart(reservations.startTime);
  const endTimeFormatted = formatDateEnd(reservations.endTime);

  const duration = calculateDuration(
    reservations.startTime,
    reservations.endTime
  );
  const paymentAmount = paymentData?.price ? paymentData.price : "계산 중...";

  const modalContent = (
    <div className="flex flex-col gap-2">
      <div>누락된 데이터가 있습니다. 예약을 처음부터 시도해 주세요.</div>
    </div>
  );
  return (
    <div>
      <div className="relative p-4">
        <div className="py-8 text-2xl font-bold"> 결제하기</div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="text-lg font-semibold">예약 일정</div>
          <div className="text-right">
            <div>{datePart}</div>
            <div>
              {timePart} - {endTimeFormatted} ({duration})
            </div>
          </div>
          <div className="flex justify-between py-4 text-lg font-semibold text-red-500">
            <div>최종 결제 금액</div>
            <div>{paymentAmount}원</div>
          </div>
        </div>
        <div className="py-8 text-2xl font-bold"> 결제 수단 </div>
        <div className="flex flex-col gap-4">
          <Button
            className="w-full py-4 text-lg font-bold bg-yellow-300 rounded-lg"
            onClick={handlePayment}
          >
            카카오페이
          </Button>
        </div>
      </div>
      <Button
        variant="long"
        className="fixed bottom-0 left-0"
        onClick={handlePayment}
      >
        {paymentAmount}원 결제하기
      </Button>
      <CustomModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="누락 오류"
        content={modalContent}
        confirmText="확인"
      />
    </div>
  );
};

export default PaymentTemplate;
