// src/pages/customer/customerbranches.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header";

// Helper: lấy user_id từ localStorage nếu ứng dụng frontend của bạn lưu user info sau login.
// Nếu không có, sẽ trả về 'guest' => giỏ hàng tách biệt theo người dùng nếu họ login.
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("user"); // giả sử bạn lưu user JSON vào key 'user'
    if (userStr) {
      const u = JSON.parse(userStr);
      return u.user_id || u.id || "guest";
    }
    // nếu bạn lưu token thay vì user object, có thể parse JWT ở đây (nếu cần)
  } catch (e) {
    // ignore
  }
  return "guest";
};

const CART_KEY_PREFIX = "cart_user_";

const CustomerBranches = () => {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const cartKey = `${CART_KEY_PREFIX}${userId}`;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get("/api/hotels");
        setBranches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Không thể tải danh sách chi nhánh");
      }
    };
    fetchBranches();
    loadCartCount();
  }, []);

  const loadCartCount = () => {
    try {
      const raw = localStorage.getItem(cartKey);
      if (!raw) {
        setCartCount(0);
        return;
      }
      const arr = JSON.parse(raw);
      const totalQty = arr.reduce((s, it) => s + (it.quantity || 0), 0);
      setCartCount(totalQty);
    } catch (e) {
      setCartCount(0);
    }
  };

  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    try {
      const roomRes = await API.get(`/api/roomTypes?hotel_id=${hotel.hotel_id}`);
      const serviceRes = await API.get(`/api/services?hotel_id=${hotel.hotel_id}`);
      setRoomTypes(Array.isArray(roomRes.data) ? roomRes.data : []);
      setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
    } catch (err) {
      console.error("Fetch room/services error:", err);
      setRoomTypes([]);
      setServices([]);
    }
  };

  // Thêm item vào cart ở localStorage. item: { type: 'room'|'service', idField, id, name, price, quantity, hotel_id }
  const addToCart = (item) => {
    try {
      const raw = localStorage.getItem(cartKey);
      const cart = raw ? JSON.parse(raw) : [];

      // Kiểm tra có tồn tại cùng phòng/dịch vụ + cùng hotel không => merge nếu có
      const matchIndex = cart.findIndex(c =>
        c.type === item.type && c.id === item.id && c.hotel_id === item.hotel_id
      );

      if (matchIndex >= 0) {
        cart[matchIndex].quantity = (cart[matchIndex].quantity || 0) + (item.quantity || 1);
      } else {
        cart.push({ ...item, quantity: item.quantity || 1 });
      }

      localStorage.setItem(cartKey, JSON.stringify(cart));
      loadCartCount();
      // Thông báo nhỏ
      alert("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Lỗi khi thêm vào giỏ");
    }
  };

  return (
    <>
      <Header />
      <div className="branches-container">
        <div className="branches-sidebar">
          <h2>Danh sách chi nhánh</h2>

          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => navigate("/customer/cart")}
              className="btn-view-booking"
            >
              Giỏ hàng ({cartCount})
            </button>
          </div>

          <Link to="/customer/booking-item">
            <button className="btn-view-booking">Xem Booking của tôi</button>
          </Link>

          {error && <p className="error">{error}</p>}
          <ul>
            {branches.map((b) => (
              <li
                key={b.hotel_id}
                onClick={() => handleSelectHotel(b)}
                className={selectedHotel?.hotel_id === b.hotel_id ? "active" : ""}
                style={{ cursor: "pointer", padding: 8, borderBottom: "1px solid #eee" }}
              >
                <strong>{b.name}</strong>
                <p style={{ margin: 0 }}>{b.address}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="branches-content">
          {!selectedHotel ? (
            <div className="placeholder">
              <h3>Hãy chọn một chi nhánh để xem phòng và dịch vụ</h3>
            </div>
          ) : (
            <>
              <div className="hotel-header">
                <h2>{selectedHotel.name}</h2>
                <p>{selectedHotel.address}</p>
              </div>

              <section className="room-section">
                <h3>Loại phòng</h3>
                {roomTypes.length > 0 ? (
                  <div className="room-grid">
                    {roomTypes.map((r) => (
                      <div key={r.room_type_id || r.id} className="room-card">
                        <div className="room-info">
                          <h4>{r.name}</h4>
                          <p className="desc">{r.description}</p>
                          <p className="price">{(r.price || 0).toLocaleString()} VND</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Link to={`/customer/room/${r.room_type_id}`}>
                              <button className="btn-detail">Chi tiết phòng</button>
                            </Link>
                            <button
                              className="btn-add"
                              onClick={() =>
                                addToCart({
                                  type: "room",
                                  id: r.room_type_id,
                                  name: r.name,
                                  price: r.price || 0,
                                  quantity: 1,
                                  hotel_id: selectedHotel.hotel_id,
                                })
                              }
                            >
                              Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có loại phòng nào.</p>
                )}
              </section>

              <section className="service-section">
                <h3>Dịch vụ</h3>
                {services.length > 0 ? (
                  <div className="service-grid">
                    {services.map((s) => (
                      <div key={s.service_id || s.id} className="service-card">
                        <div className="service-info">
                          <h4>{s.name}</h4>
                          <p className="desc">{s.description}</p>
                          <p className="price">{(s.price || 0).toLocaleString()} VND</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Link to={`/customer/service/${s.service_id}`}>
                              <button className="btn-detail">Chi tiết dịch vụ</button>
                            </Link>
                            <button
                              className="btn-add"
                              onClick={() =>
                                addToCart({
                                  type: "service",
                                  id: s.service_id,
                                  name: s.name,
                                  price: s.price || 0,
                                  quantity: 1,
                                  hotel_id: selectedHotel.hotel_id,
                                })
                              }
                            >
                              Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có dịch vụ nào.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerBranches;
