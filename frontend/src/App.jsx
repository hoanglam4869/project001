import React from 'react';
import './css/App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Component bảo vệ
import AuthGuard from './components/authguard.jsx';

// Import các trang
import Login from "./pages/auth/login";
import CustomerBranches from './pages/customer/customerbranches.jsx';
import RoomDetail from './pages/customer/roomDetail.jsx';
import ServiceDetail from './pages/customer/serviceDetail.jsx';
import Cart from "./pages/customer/cart.jsx";
import BookingCreate from './pages/customer/bookingcreate.jsx';
import BookingHistory from './pages/customer/bookinghistory.jsx';
import BookingManagement from './pages/staff/bookingmanage.jsx';
import BookingDetail from './pages/shared/bookingdetail.jsx';
import VoucherManagement from './pages/staff/vouchermanage.jsx';
import RoomTypeManagement from './pages/manager/roomtypemanage.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* === CÁC ROUTE CÔNG KHAI (AI CŨNG XEM ĐƯỢC) === */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/unauthorized" element={<h1>Bạn không có quyền truy cập trang này</h1>} />
        
        {/* Khách vãng lai có thể xem chi tiết */}
        <Route path="/customer/branches" element={<CustomerBranches />} />
        <Route path="/customer/room/:id" element={<RoomDetail />} />
        <Route path="/customer/service/:id" element={<ServiceDetail />} />

        
        {/* === CÁC ROUTE CỦA CUSTOMER (BẮT BUỘC ĐĂNG NHẬP) === */}
        <Route element={<AuthGuard allowedRoles={['customer']} />}>
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/booking-create" element={<BookingCreate />} />
          <Route path="/customer/booking-history" element={<BookingHistory />} />
        </Route>

        
        {/* === CÁC ROUTE CỦA STAFF (BẮT BUỘC ĐĂNG NHẬP) === */}        
        <Route element={<AuthGuard allowedRoles={['staff']} />}>
          <Route path="/staff/bookings" element={<BookingManagement />} />
          <Route path="/staff/vouchers" element={<VoucherManagement />} />
        </Route>

        {/* === CÁC ROUTE CỦA ADMIN (BẮT BUỘC ĐĂNG NHẬP) === */}        
        <Route element={<AuthGuard allowedRoles={['manager']} />}>
          <Route path="/manager/room-types" element={<RoomTypeManagement />} />
        </Route>

        
        {/* === ROUTE CHUNG (CHỈ CẦN ĐĂNG NHẬP, ROLE NÀO CŨNG ĐƯỢC) === */}
        <Route element={<AuthGuard />}>
          <Route path="/booking-detail/:id" element={<BookingDetail />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}

export default App