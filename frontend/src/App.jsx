import { useState } from 'react'
import './css/App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import CustomerBranches from './pages/customer/customerbranches';
import RoomDetail from './pages/customer/roomDetail.jsx';
import ServiceDetail from './pages/customer/serviceDetail.jsx';

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
