import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth/login");
        return;
      }

      try {
        setLoading(true);
        const res = await API.get(`/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Bạn không có quyền xem booking này.");
        } else {
          setError(err.response?.data?.msg || "Không tìm thấy booking.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  if (loading) return <div><Header />Đang tải chi tiết...</div>;
  if (error) return <div><Header /><p>{error}</p></div>;
  if (!booking) return <div><Header />Không có dữ liệu.</div>;

  const start = new Date(booking.checkin_date);
  const end = new Date(booking.checkout_date);
  const numNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Header />
      <div>
        <button onClick={() => navigate(-1)}>&larr; Quay lại</button>
        
        <h2>Chi tiết Đặt phòng #{booking.booking_id}</h2>
        <p>Trạng thái: <strong>{booking.status.toUpperCase()}</strong></p>

        <div>
          <div >
            <h3>Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> {booking.customer_name}</p>
            <p><strong>Email:</strong> {booking.customer_email}</p>
            <p><strong>SĐT:</strong> {booking.customer_phone}</p>
            <p><strong>Tài khoản (nếu có):</strong> {booking.User?.email || '(Khách vãng lai)'}</p>
            
            <hr />

            <h3>Thông tin thời gian</h3>
            <p><strong>Ngày đặt:</strong> {formatDateTime(booking.createdAt)}</p>
            <p><strong>Check-in:</strong> {formatDateTime(booking.checkin_date)}</p>
            <p><strong>Check-out:</strong> {formatDateTime(booking.checkout_date)}</p>
            <p><strong>Số đêm:</strong> {numNights}</p>
          </div>

          <div>
            <h3>Chi tiết phòng & dịch vụ</h3>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {booking.BookingItems.map((item) => (
                  <tr key={item.booking_item_id}>
                    <td>
                      {item.RoomType ? `(Phòng) ${item.RoomType.name}` : `(DV) ${item.Service.name}`}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.unit_price.toLocaleString()} VND</td>
                    <td>{item.total_price.toLocaleString()} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Thanh toán</h3>
            <p><strong>Tạm tính:</strong> {booking.total_price.toLocaleString()} VND</p>
            <p><strong>Voucher:</strong> {booking.Voucher ? `${booking.Voucher.name} (-${(booking.total_price - booking.final_price).toLocaleString()} VND)` : 'Không áp dụng'}</p>
            <h4>Thành tiền: {booking.final_price.toLocaleString()} VND</h4>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetail;