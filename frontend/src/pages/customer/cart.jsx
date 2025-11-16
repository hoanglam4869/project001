import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header";

const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      return u.user_id || u.id || "guest";
    }
  } catch (e) {}
  return "guest";
};

const CART_KEY_PREFIX = "cart_user_";

const Cart = () => {
  const userId = getCurrentUserId();
  const cartKey = `${CART_KEY_PREFIX}${userId}`;
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const raw = localStorage.getItem(cartKey);
      const arr = raw ? JSON.parse(raw) : [];
      setItems(arr);
    } catch (e) {
      setItems([]);
    }
  };

  const saveCart = (newItems) => {
    localStorage.setItem(cartKey, JSON.stringify(newItems));
    setItems(newItems);
  };

  const updateQty = (index, qty) => {
    const q = parseInt(qty, 10);
    if (isNaN(q) || q < 1) return;
    const newItems = [...items];
    newItems[index].quantity = q;
    saveCart(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    saveCart(newItems);
  };

  const clearCart = () => {
    localStorage.removeItem(cartKey);
    setItems([]);
  };

  const subtotal = items.reduce(
    (s, it) => s + (it.price || 0) * (it.quantity || 0),
    0
  );

  // 🚀 Khi nhấn “Tiến hành thanh toán” → chuyển đến BookingCreate
  const proceedToCheckout = () => {
    // Lưu tạm cart dùng chung key để BookingCreate đọc lại
    localStorage.setItem("cart", JSON.stringify(items));
    navigate("/customer/booking-create");
  };

  return (
    <>
      <Header />
      <div style={{ padding: 20 }}>
        <h2>Giỏ hàng của bạn</h2>
        {items.length === 0 ? (
          <div>
            <p>Giỏ hàng trống.</p>
            <Link to="/customer/branches">
              <button>Quay lại chọn phòng & dịch vụ</button>
            </Link>
          </div>
        ) : (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Sản phẩm</th>
                  <th style={{ padding: 8 }}>Loại</th>
                  <th style={{ padding: 8 }}>Giá</th>
                  <th style={{ padding: 8 }}>Số lượng</th>
                  <th style={{ padding: 8 }}>Tổng</th>
                  <th style={{ padding: 8 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 8 }}>{it.name}</td>
                    <td style={{ padding: 8 }}>{it.type}</td>
                    <td style={{ padding: 8 }}>
                      {(it.price || 0).toLocaleString()} VND
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateQty(idx, e.target.value)}
                        style={{ width: 80 }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      {((it.price || 0) * (it.quantity || 0)).toLocaleString()}{" "}
                      VND
                    </td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => removeItem(idx)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <button onClick={clearCart} style={{ marginRight: 8 }}>
                  Xóa toàn bộ
                </button>
                <Link to="/customer/branches">
                  <button>Tiếp tục chọn</button>
                </Link>
              </div>

              <div>
                <strong>Tổng: {(subtotal || 0).toLocaleString()} VND</strong>
                <div style={{ marginTop: 8 }}>
                  <button onClick={proceedToCheckout}>
                    Tiến hành thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
