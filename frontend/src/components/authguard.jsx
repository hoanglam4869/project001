import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 1. Kiểm tra đã đăng nhập chưa
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  // 2. Kiểm tra quyền (nếu yêu cầu)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu OK, cho phép truy cập
  return <Outlet />;
};

export default AuthGuard;