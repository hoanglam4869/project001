import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return <span>Chờ xử lý</span>;
    case "accepted":
      return <span>Đã xác nhận</span>;
    case "completed":
      return <span>Hoàn thành</span>;
    case "cancelled":
      return <span>Đã hủy</span>;
    default:
      return status;
  }
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vui lòng đăng nhập để xem lịch sử đặt phòng.");
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/api/bookings/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const sortedBookings = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sortedBookings);

      } catch (err) {
        setError(err.response?.data?.msg || "Không thể tải lịch sử đặt phòng.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [navigate]);

  // ✅ SỬA: Hàm render an toàn, không crash nếu Room/Service bị null
  const renderBookingItems = (items) => {
     if (!items || items.length === 0) return <li>Không có chi tiết</li>;
     return items.map(item => {
        let displayText = "Sản phẩm đã bị xóa";
        if (item.RoomType) {
            displayText = `Phòng: ${item.RoomType.name}`;
        } else if (item.Service) {
            displayText = `Dịch vụ: ${item.Service.name}`;
        }

        return (
            <li key={item.booking_item_id}>
               {displayText} (x{item.quantity})
            </li>
        );
     });
  };

  const renderContent = () => {
    if (loading) {
      return <p>Đang tải lịch sử của bạn...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (bookings.length === 0) {
      return (
        <div>
          <p>Bạn chưa có đặt phòng nào.</p>
          <Link to="/customer/branches">
            <button>Đặt phòng ngay</button>
          </Link>
        </div>
      );
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Mã ĐP</th>
            <th>Ngày đặt</th>
            <th>Check-in / Check-out</th>
            <th>Chi tiết</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th> {/* THÊM CỘT MỚI */}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.booking_id}>
              <td>#{b.booking_id}</td>
              <td>{formatDate(b.createdAt)}</td>
              <td>
                {formatDate(b.checkin_date)} - {formatDate(b.checkout_date)}
              </td>
               <td>
                 <ul>
                   {renderBookingItems(b.BookingItems)}
                 </ul>
              </td>
              <td>
                {b.final_price.toLocaleString()} VND
                {b.Voucher && <div><i>Đã áp dụng: {b.Voucher.code}</i></div>}
              </td>
              <td>{getStatusText(b.status)}</td>
              {/* THÊM NÚT XEM CHI TIẾT */}
              <td>
                <Link to={`/booking-detail/${b.booking_id}`}>
                  <button>Xem chi tiết</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <Header />
      <div>
        <h2>Lịch sử đặt phòng của tôi</h2>
        {renderContent()}
      </div>
    </>
  );
};

export default BookingHistory;