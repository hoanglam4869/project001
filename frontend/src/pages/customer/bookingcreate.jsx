import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header";

const BookingCreate = () => {
  const navigate = useNavigate();
  // Trạng thái tải (giúp ngăn chặn double click và hiển thị thông báo)
  const [isLoading, setIsLoading] = useState(false);
  // Trạng thái thông báo thành công
  const [message, setMessage] = useState(""); 

  // Lấy thông tin người dùng từ localStorage (nếu có)
  let initialUser = {};
  try {
    initialUser = JSON.parse(localStorage.getItem("user")) || {};
  } catch (e) {
    console.error("Lỗi đọc thông tin người dùng từ localStorage:", e);
  }

  const [form, setForm] = useState({
    customer_name: initialUser.name || "",
    customer_email: initialUser.email || "",
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

  // 1. Tải Giỏ hàng
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    setItems(saved);
  }, []);

  // 2. Tải Voucher theo hotel_id
  useEffect(() => {
    if (items.length === 0) return;

    const hotelId = items[0].hotel_id;

    const loadVoucher = async () => {
      try {
        const res = await API.get(`/api/vouchers`, {
          params: { hotel_id: hotelId },
        });
        setVouchers(res.data);
      } catch (e) {
        console.error("Lỗi tải voucher:", e);
      }
    };

    loadVoucher();
  }, [items]);

  // 3. Tính toán Subtotal và DiffDays
  useEffect(() => {
    if (!form.checkin_date || !form.checkout_date) return;

    const start = new Date(form.checkin_date);
    const end = new Date(form.checkout_date);
    
    // Đảm bảo so sánh chính xác theo ngày
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    let days = Math.ceil((end - start) / 86400000);
    days = Math.max(days, 1);
    setDiffDays(days);

    const sub = items.reduce(
      (s, it) => s + (it.price || 0) * (it.quantity || 0) * days,
      0
    );

    setSubtotal(sub);
  }, [items, form.checkin_date, form.checkout_date]);

  // 4. Áp dụng Voucher (Gọi API)
  useEffect(() => {
    const applyVoucher = async () => {
      if (!form.voucher_id || subtotal === 0) {
        setDiscount(0);
        setTotal(subtotal);
        return;
      }
      
      setIsLoading(true);
      setError("");

      try {
        const res = await API.get(`/api/vouchers/apply`, {
          params: { voucher_id: form.voucher_id, subtotal },
        });

        setDiscount(res.data.discount);
        setTotal(res.data.final_price);
        
      } catch (e) {
        const errorMsg = e.response?.data?.msg || "Lỗi không xác định khi áp dụng voucher";
        console.error("Lỗi áp dụng voucher:", errorMsg);
        setError(`Voucher không hợp lệ: ${errorMsg}`);
        
        setForm(prev => ({ ...prev, voucher_id: "" })); 
        setDiscount(0);
        setTotal(subtotal);
      } finally {
        setIsLoading(false);
      }
    };

    applyVoucher();
  }, [form.voucher_id, subtotal]); 

  const handleChange = (e) => {
    // Khi thay đổi ngày, reset voucher
    if (e.target.name === 'checkin_date' || e.target.name === 'checkout_date') {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value, voucher_id: "" }));
    } else {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // HÀM KIỂM TRA TÍNH HỢP LỆ CỦA VOUCHER (Lọc nghiêm ngặt: Phải đang trong thời gian hiệu lực)
  const isVoucherCurrentlyActive = (voucher) => {
    const now = new Date();
    // Đặt giờ về 0 để so sánh chính xác theo ngày
    now.setHours(0, 0, 0, 0); 
    
    const voucherStart = new Date(voucher.start_date);
    const voucherEnd = new Date(voucher.end_date);
    
    voucherStart.setHours(0, 0, 0, 0);
    voucherEnd.setHours(0, 0, 0, 0);
    
    // Voucher hợp lệ nếu ngày hiện tại nằm trong khoảng [start_date, end_date]
    return now >= voucherStart && now <= voucherEnd;
  };


  const validateDates = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const checkin = new Date(form.checkin_date).setHours(0, 0, 0, 0);
    const checkout = new Date(form.checkout_date).setHours(0, 0, 0, 0);

    if (!form.checkin_date || !form.checkout_date) {
      setError("Vui lòng chọn ngày check-in và check-out");
      return false;
    }
    if (checkin < today) {
      setError("Ngày check-in không được ở trong quá khứ");
      return false;
    }
    if (checkout <= checkin) {
      setError("Ngày check-out phải sau check-in ít nhất 1 ngày");
      return false;
    }
    return true;
  };

  const handleSubmit = async (method) => {
    setError("");
    setMessage("");
    if (isLoading) return; // Ngăn chặn double submit

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

    // Kiểm tra lại tính hợp lệ của voucher (chỉ áp dụng cho voucher đang hiển thị)
    if (form.voucher_id) {
        const selectedVoucher = vouchers.find(v => String(v.voucher_id) === String(form.voucher_id));
        if (selectedVoucher && !isVoucherCurrentlyActive(selectedVoucher)) {
             setError("Voucher bạn chọn đã hết hạn hoặc chưa kích hoạt!");
             setForm(prev => ({ ...prev, voucher_id: "" })); 
             return;
        }
    }
    
    setIsLoading(true);
    try {
      const resBooking = await API.post(
        "/api/bookings",
        {
          hotel_id: items[0]?.hotel_id || 1, // Giả định lấy hotel_id từ item đầu tiên trong giỏ hàng
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
      console.log(`Booking ID đã tạo: ${bookingId}`);

      if (method === "QR") {
        // Chuyển hướng đến cổng thanh toán PayOS
        const resQR = await API.post(
          `/api/bookings/${bookingId}/payment-payos`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.location.href = resQR.data.paymentUrl;
      } else {
        // Thanh toán tiền mặt thành công
        setMessage("Đặt phòng thành công! Cảm ơn bạn đã sử dụng dịch vụ.");
        localStorage.removeItem("cart");
        
        // Điều hướng sau 2 giây
        setTimeout(() => navigate("/customer/branches"), 2000); 
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi server khi tạo booking");
    } finally {
        setIsLoading(false);
    }
  };
  
  // Áp dụng bộ lọc nghiêm ngặt
  const validVouchers = vouchers.filter(isVoucherCurrentlyActive);

  return (
    <>
      <Header />
      <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
        <h2>Thông tin đặt phòng / dịch vụ</h2>

        {isLoading && <p>Đang xử lý, vui lòng chờ...</p>}
        {error && <p style={{ color: "red" }}>Lỗi: {error}</p>}
        {message && <p style={{ color: "green" }}>Thông báo: {message}</p>}
        
        {/* THÔNG TIN KHÁCH HÀNG */}
        <h3>Thông tin liên hệ</h3>
        <input name="customer_name" placeholder="Họ và tên (*)" value={form.customer_name} onChange={handleChange} disabled={isLoading} required />
        <input name="customer_email" placeholder="Email (*)" type="email" value={form.customer_email} onChange={handleChange} disabled={isLoading} required />
        <input name="customer_phone" placeholder="Số điện thoại (*)" type="tel" value={form.customer_phone} onChange={handleChange} disabled={isLoading} required />

        {/* THỜI GIAN BOOKING */}
        <h3>Thời gian đặt</h3>
        <label>Ngày check-in (*): </label>
        <input type="date" name="checkin_date" value={form.checkin_date} onChange={handleChange} disabled={isLoading} />
        <br/>
        <label>Ngày check-out (*): </label>
        <input type="date" name="checkout_date" value={form.checkout_date} onChange={handleChange} disabled={isLoading} />
        
        <p>Tổng số ngày thuê: {diffDays} ngày</p>

        {/* CHỌN VOUCHER (ĐÃ LỌC) */}
        <h3>Chọn voucher</h3>
        <select name="voucher_id" value={form.voucher_id} onChange={handleChange} disabled={isLoading}>
          <option value="">-- Không dùng voucher --</option>
          {validVouchers.length > 0 ? (
            validVouchers.map((v) => (
                <option key={v.voucher_id} value={v.voucher_id}>
                {v.name} 
                {v.type === 'percent'
                    ? ` (Giảm ${parseFloat(v.voucher_value)}%)`
                    : ` (Giảm ${parseFloat(v.voucher_value).toLocaleString()} VND)`
                }
                {` | Hiệu lực: ${new Date(v.start_date).toLocaleDateString()} - ${new Date(v.end_date).toLocaleDateString()}`}
                </option>
            ))
          ) : (
            <option disabled>Không có voucher hợp lệ tại thời điểm này</option>
          )}
        </select>

        {/* DANH SÁCH SẢN PHẨM */}
        <h3>Danh sách sản phẩm ({items.length} mục)</h3>
        <ul>
          {items.map((it, idx) => (
            <li key={idx}>
              {it.name} x {it.quantity} x {diffDays} ngày = {(it.price * it.quantity * diffDays).toLocaleString()} VND
            </li>
          ))}
        </ul>

        {/* TÓM TẮT GIÁ */}
        <h3>Tóm tắt</h3>
        <p>Tạm tính: {subtotal.toLocaleString()} VND</p>
        <p style={{ color: 'red' }}>Giảm giá Voucher: - {discount.toLocaleString()} VND</p>
        <h3>Tổng cộng: {total.toLocaleString()} VND</h3>
        
        {/* THANH TOÁN */}
        <h3>Phương thức thanh toán</h3>
        <button onClick={() => handleSubmit("CASH")} disabled={isLoading || items.length === 0}>
            {isLoading ? "Đang tải..." : "Thanh toán tiền mặt"}
        </button>
        <button onClick={() => handleSubmit("QR")} disabled={isLoading || items.length === 0}>
            {isLoading ? "Đang tải..." : "Thanh toán online (QR PayOS)"}
        </button>
      </div>
    </>
  );
};

export default BookingCreate;