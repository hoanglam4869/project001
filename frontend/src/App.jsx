import { useState } from 'react'
import './css/App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login";
import CustomerBranches from './pages/customer/customerbranches';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        {/* Sau này thêm CustomerBranches, StaffBooking... */}
        <Route path="/customer/branches" element={<CustomerBranches />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
