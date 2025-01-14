import { instance } from "./instance";

export const pgpayment = (bay_id, data) => {
  return instance.post(`/api/user/payment/ready/${bay_id}`, data, {
    withCredentials: true,
  });
};

export const pgapprove = (carwash_id, bay_id, data) => {
  return instance.post(
    `/api/user/payment/approve/${carwash_id}/${bay_id}`,
    data
  );
};
