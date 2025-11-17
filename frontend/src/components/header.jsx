import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/header.scss";
import logo from "../assets/logo.png";
import hotline from "../assets/hotline.png";
import userImg from "../assets/user.jpg";
import vnlogo from "../assets/vnlogo.png";

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (user && user.user_id) {
      // ✅ Xóa giỏ hàng riêng của user
      localStorage.removeItem(`bookingItems_${user.user_id}`);
    } else {
      // ✅ Xóa giỏ hàng guest nếu có
      localStorage.removeItem("bookingItems_guest");
    }

    // ✅ Xóa thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // ✅ Quay về trang login
    navigate("/auth/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo" />
        <p>Hotels & Resorts</p>
      </div>

      <div className="header-right">
        <div className="header-right-info">
          <div className="inform">
            <img src={hotline} alt="Hotline" />
            <p>(+84) 0123456789</p>
          </div>

          <div className="inform">
            <img src={userImg} alt="User" />
            {token ? (
              <p>{user ? `Xin chào, ${user.email}` : "Thành viên"}</p>
            ) : (
              <Link
                to="/auth/login"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <p>Đăng nhập</p>
              </Link>
            )}
          </div>

          <div className="inform">
            <img src={vnlogo} alt="VN" />
            <p>VI</p>
          </div>
        </div>

        <div className="header-right-menu">
          <ul>
            <li>Quần thể</li>
            <li>Ưu đãi</li>
            <li>Trải nghiệm</li>
            <li>Liên hệ</li>
            <li>Về chúng tôi</li>

            {/* 👇 THÊM LINK LỊCH SỬ ĐẶT PHÒNG TẠI ĐÂY */}
            {token && (
              <li>
                <Link
                  to="/customer/booking-history"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Lịch sử đặt phòng
                </Link>
              </li>
            )}

            {token && (
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: "#c0392b",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Đăng xuất
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;