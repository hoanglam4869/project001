import { useState } from 'react'
import './css/App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import CustomerBranches from './pages/customer/customerbranches.jsx';
import RoomDetail from './pages/customer/roomDetail.jsx';
import ServiceDetail from './pages/customer/serviceDetail.jsx';
import Cart from "./pages/customer/cart.jsx";
import BookingCreate from './pages/customer/bookingcreate.jsx';


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        {/* Sau này thêm CustomerBranches, StaffBooking... */}
        <Route path="/customer/branches" element={<CustomerBranches />} />
        <Route path="/customer/room/:id" element={<RoomDetail />} />
        <Route path="/customer/service/:id" element={<ServiceDetail />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/booking-create" element={<BookingCreate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
