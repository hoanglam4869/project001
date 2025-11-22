import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import { useNavigate, Link } from "react-router-dom"; // Thêm Link

const STATUS_OPTIONS = ["pending", "accepted", "completed", "cancelled"];

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không có token. Vui lòng đăng nhập lại.");
        setLoading(false);
        navigate("/auth/login");
        return;
      }

      try {
        const res = await API.get("/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sorted);

      } catch (err) {
        if (err.response?.status === 403) {
            setError("Bạn không có quyền truy cập trang này.");
        } else {
            setError(err.response?.data?.msg || "Lỗi khi tải danh sách booking.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, [navigate]);

  const handleStatusChange = async (bookingId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await API.put(
        `/api/bookings/${bookingId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.booking_id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      
      alert("Cập nhật trạng thái thành công!");

    } catch (err) {
      alert("Lỗi khi cập nhật: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA booking này? Hành động này không thể hoàn tác.")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
        await API.delete(`/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setBookings((prevBookings) => 
            prevBookings.filter((b) => b.booking_id !== bookingId)
        );
        alert("Đã xóa booking thành công.");

    } catch (err) {
        alert("Lỗi khi xóa: " + (err.response?.data?.msg || err.message));
    }
  };

  // ✅ SỬA: Hàm render an toàn cho trang quản lý của Staff
  const renderBookingItems = (items) => {
     if (!items || items.length === 0) return <li>(Không có)</li>;
     return items.map(item => {
        let displayText = <span style={{color: 'red', fontStyle: 'italic'}}>Đã bị xóa</span>;
        
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

  if (loading) return <div><Header />Đang tải...</div>;
  if (error) return <div><Header /><p>{error}</p></div>;

  return (
    <>
      <Header />
      <div>
        <h2>Quản lý Đặt phòng (Staff)</h2>

        <table>
          <thead>
            <tr>
              <th>Mã ĐP</th>
              <th>Khách hàng</th>
              <th>Check-in / Out</th>
              <th>Chi tiết</th>
              <th>Tổng tiền</th>
              <th>Trạng thái (Status)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.booking_id}>
                <td>#{b.booking_id}</td>
                <td>
                  {b.customer_name}<br/>
                  <small>{b.customer_email}</small><br/>
                  <small>{b.customer_phone}</small>
                </td>
                <td>
                  {formatDate(b.checkin_date)}<br/>
                  {formatDate(b.checkout_date)}
                </td>
                <td>
                  <ul>
                    {renderBookingItems(b.BookingItems)}
                  </ul>
                </td>
                <td>{b.final_price.toLocaleString()} VND</td>
                <td>
                  <select
                    value={b.status}
                    onChange={(e) => handleStatusChange(b.booking_id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {/* NÚT XEM CHI TIẾT ĐƯỢC THÊM VÀO */}
                  <Link to={`/booking-detail/${b.booking_id}`}>
                    <button>Xem chi tiết</button>
                  </Link>
                  <button
                    onClick={() => handleDeleteBooking(b.booking_id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BookingManagement;