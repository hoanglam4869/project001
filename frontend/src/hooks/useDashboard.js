import useSWR from "swr";
import API from "../api/api";

// Fetcher function cho SWR
const fetcher = (url) => 
  API.get(url, { 
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
  }).then((res) => res.data);

// Hook cho Staff
export function useStaffDashboard() {
  const { data, error, isLoading } = useSWR(
    "/api/dashboard/staff", 
    fetcher,
    {
      refreshInterval: 3000, // Tự động gọi lại sau mỗi 5 giây
      revalidateOnFocus: true, // Gọi lại khi tab được focus
    }
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}

// Hook cho Manager
export function useManagerDashboard(hotelId) {
  const { data, error, isLoading } = useSWR(
    hotelId ? `/api/dashboard/manager?hotel_id=${hotelId}` : null, // Chỉ fetch khi có hotelId
    fetcher,
    {
      refreshInterval: 3000, // Manager cập nhật chậm hơn chút cũng được (10s)
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}