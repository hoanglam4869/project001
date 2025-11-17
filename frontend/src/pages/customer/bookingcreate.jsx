import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header";

const BookingCreate = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    checkin_date: new Date().toISOString().split("T")[0],
    checkout_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    voucher_id: "",
    payment_method: "CASH",
  });

  const [items, setItems] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [diffDays, setDiffDays] = useState(1);

  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  const [error, setError] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(saved);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const hotelId = items[0].hotel_id;

    const loadVoucher = async () => {
      try {
        const res = await API.get(`/api/vouchers`, {
          params: { hotel_id: hotelId },
        });
        setVouchers(res.data);
      } catch {}
    };

    loadVoucher();
  }, [items]);

  useEffect(() => {
    if (!form.checkin_date || !form.checkout_date) return;

    const start = new Date(form.checkin_date);
    const end = new Date(form.checkout_date);
    let days = Math.ceil((end - start) / 86400000);
    days = Math.max(days, 1);
    setDiffDays(days);

    const sub = items.reduce(
      (s, it) => s + (it.price || 0) * (it.quantity || 0) * days,
      0
    );

    setSubtotal(sub);
  }, [items, form.checkin_date, form.checkout_date]);

  useEffect(() => {
    const applyVoucher = async () => {
      if (!form.voucher_id) {
        setDiscount(0);
        setTotal(subtotal);
        return;
      }

      try {
        const res = await API.get(`/api/vouchers/apply`, {
          params: { voucher_id: form.voucher_id, subtotal },
        });

        setDiscount(res.data.discount);
        setTotal(res.data.final_price);
      } catch (e) {
        setDiscount(0);
        setTotal(subtotal);
      }
    };

    applyVoucher();
  }, [form.voucher_id, subtotal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateDates = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const checkin = new Date(form.checkin_date).setHours(0, 0, 0, 0);
    const checkout = new Date(form.checkout_date).setHours(0, 0, 0, 0);

    if (!form.checkin_date || !form.checkout_date) {
      setError("Vui lòng chọn ngày check-in và check-out");
      return false;
    }
    if (checkin < today || checkout < today) {
      setError("Ngày check-in hoặc check-out không được ở trong quá khứ");
      return false;
    }
    if (checkout <= checkin) {
      setError("Ngày check-out phải sau check-in");
      return false;
    }
    return true;
  };

  const handleSubmit = async (method) => {
    setError("");
    if (!validateDates()) return;

    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      setError("Vui lòng điền đầy đủ thông tin khách hàng");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Bạn cần đăng nhập trước khi đặt phòng");
      return;
    }

    try {
      const resBooking = await API.post(
        "/api/bookings",
        {
          hotel_id: items[0]?.hotel_id || 1,
          checkin_date: form.checkin_date,
          checkout_date: form.checkout_date,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          voucher_id: form.voucher_id || null,
          items: items.map((it) => ({
            room_type_id: it.type === "room" ? it.id : null,
            service_id: it.type === "service" ? it.id : null,
            quantity: it.quantity,
          })),
          payment_method: method,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bookingId = resBooking.data.booking_id;

      if (method === "QR") {
        const resQR = await API.post(
          `/api/bookings/${bookingId}/payment-payos`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.href = resQR.data.paymentUrl;
      } else {
        alert("Đặt phòng thành công!");
        localStorage.removeItem("cart");
        navigate("/customer/branches");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi server khi tạo booking");
    }
  };

  return (
    <>
      <Header />
      <div>
        <h2>Thông tin đặt phòng / dịch vụ</h2>

        {error && <p>{error}</p>}

        <input name="customer_name" placeholder="Họ và tên" value={form.customer_name} onChange={handleChange} />
        <input name="customer_email" placeholder="Email" value={form.customer_email} onChange={handleChange} />
        <input name="customer_phone" placeholder="Số điện thoại" value={form.customer_phone} onChange={handleChange} />

        <label>Ngày check-in</label>
        <input type="date" name="checkin_date" value={form.checkin_date} onChange={handleChange} />

        <label>Ngày check-out</label>
        <input type="date" name="checkout_date" value={form.checkout_date} onChange={handleChange} />

        <label>Chọn voucher</label>
        <select name="voucher_id" value={form.voucher_id} onChange={handleChange}>
          <option value="">-- Không dùng voucher --</option>
          {vouchers.map((v) => (
            <option key={v.voucher_id} value={v.voucher_id}>
              {/* 👇 ĐÃ SỬA LẠI CHỖ NÀY */}
              {v.name} 
              {v.type === 'percent'
                ? ` (Giảm ${parseFloat(v.voucher_value)}%)`
                : ` (Giảm ${parseFloat(v.voucher_value).toLocaleString()} VND)`
              }
            </option>
          ))}
        </select>

        <h3>Danh sách sản phẩm</h3>
        <ul>
          {items.map((it, idx) => (
            <li key={idx}>
              {it.name} x {it.quantity} x {diffDays} ngày = {(it.price * it.quantity * diffDays).toLocaleString()} VND
            </li>
          ))}
        </ul>

        <h3>Subtotal: {subtotal.toLocaleString()} VND</h3>
        <h3>Discount: {discount.toLocaleString()} VND</h3>
        <h3>Total: {total.toLocaleString()} VND</h3>

        <button onClick={() => handleSubmit("CASH")}>Thanh toán tiền mặt</button>
        <button onClick={() => handleSubmit("QR")}>Thanh toán online (QR PayOS)</button>
      </div>
    </>
  );
};

export default BookingCreate;
