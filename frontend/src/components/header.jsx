import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/header.scss";
import logo from "../assets/logo.png";
import hotline from "../assets/hotline.png";
import userImg from "../assets/user.jpg";
import vnlogo from "../assets/vnlogo.png";

const Header = () => {
  const navigate = useNavigate();
  
  // Lấy thông tin từ localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); 
  const user = JSON.parse(localStorage.getItem("user"));

  // Xử lý đăng xuất
  const handleLogout = () => {
    if (user && user.user_id) {
      // Xóa giỏ hàng riêng của user
      localStorage.removeItem(`bookingItems_${user.user_id}`);
    } else {
      // Xóa giỏ hàng guest nếu có
      localStorage.removeItem("bookingItems_guest");
    }

    // Xóa toàn bộ session
    localStorage.clear(); 

    // Quay về trang login
    navigate("/auth/login");
  };

  // === HÀM RENDER MENU DỰA THEO ROLE ===
  const renderNavLinks = () => {
    // 1. Nếu chưa đăng nhập (Guest)
    if (!token) {
      return (
        <>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/customer/branches">Đặt phòng</Link></li>
          <li><Link to="/about">Về chúng tôi</Link></li>
          <li><Link to="/contact">Liên hệ</Link></li>
        </>
      );
    }

    // 2. Nếu đã đăng nhập -> Kiểm tra Role
    switch (role) {
      case "customer":
        return (
          <>
            <li><Link to="/customer/branches">Đặt phòng ngay</Link></li>
            <li><Link to="/customer/cart">Giỏ hàng</Link></li>
            <li><Link to="/customer/booking-history">Lịch sử đặt phòng</Link></li>
          </>
        );

      case "staff":
        return (
          <>
            {/* Menu chức năng cho Staff */}
            <li><Link to="/staff/bookings">Quản lý Đặt phòng</Link></li>
            <li><Link to="/staff/vouchers">Quản lý Voucher</Link></li>
          </>
        );

      case "manager":
        return (
          <>
            <li><Link to="/staff/bookings">Xem Booking</Link></li>
            <li><Link to="/manager/reports">Báo cáo doanh thu</Link></li>
            <li><Link to="/manager/staffs">Quản lý nhân viên</Link></li>
          </>
        );

      case "admin":
        return (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/users">Quản lý Tài khoản</Link></li>
            <li><Link to="/admin/hotels">Quản lý Khách sạn</Link></li>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <header className="header">
      {/* Logo click về trang chủ hoặc trang quản lý tùy role */}
      <div className="header-left" onClick={() => navigate(role === 'staff' || role === 'manager' || role === 'admin' ? `/${role}/dashboard` : '/')}>
        <img src={logo} alt="Logo" style={{cursor: 'pointer'}} />
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
              <div style={{display: 'flex', flexDirection: 'column', lineHeight: '1.2'}}>
                 {/* ✅ Hiển thị TÊN CHÍNH XÁC: user.name */}
                 <span>{user ? `Xin chào, ${user.name}` : "Thành viên"}</span>
                 {/* Hiển thị Role nhỏ bên dưới */}
                 <span style={{fontSize: '10px', color: '#888', textTransform: 'uppercase'}}>({role})</span>
              </div>
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
            {/* Gọi hàm render menu động ở đây */}
            {renderNavLinks()}

            {/* Nút Đăng xuất */}
            {token && (
              <li>
                <button
                  onClick={handleLogout}
                  className="btn-logout" 
                  // Comment style để dùng header.scss (theo yêu cầu của bạn)
                  /* style={{
                    backgroundColor: "#c0392b",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginLeft: "10px"
                  }} */
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