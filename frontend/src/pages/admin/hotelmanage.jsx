import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import { useNavigate } from "react-router-dom";

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);

  // --- 1. LOAD DANH SÁCH HOTELS ---
  useEffect(() => {
    const fetchHotels = async () => {
      const token = localStorage.getItem("token");

      if (!token || currentUser.role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        navigate("/");
        return;
      }

      try {
        const res = await API.get("/api/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotels(res.data.sort((a, b) => b.hotel_id - a.hotel_id));
      } catch (err) {
        setError(err.response?.data?.msg || "Lỗi khi tải danh sách khách sạn.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [navigate, currentUser.role]);

  // --- 2. HANDLE INPUT CHANGE ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- 3. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setError("");

    if (!form.name || !form.address || !form.phone) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      if (editingId) {
        const res = await API.put(`/api/hotels/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotels((prev) =>
          prev.map((h) => (h.hotel_id === editingId ? res.data.hotel : h))
        );
        alert("Cập nhật khách sạn thành công!");
      } else {
        const res = await API.post("/api/hotels", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.hotel) {
            setHotels([res.data.hotel, ...hotels]);
        }
        alert("Thêm khách sạn mới thành công!");
      }
      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.msg || "Server Error"));
    }
  };

  // --- 4. DELETE ---
  const handleDelete = async (id) => {
    const confirmMsg = "CẢNH BÁO: Xóa khách sạn này sẽ gỡ bỏ quyền quản lý của tất cả Staff/Manager thuộc khách sạn này.\n\nBạn có chắc chắn muốn xóa?";
    if (!window.confirm(confirmMsg)) return;
    
    const token = localStorage.getItem("token");
    try {
      await API.delete(`/api/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(hotels.filter((h) => h.hotel_id !== id));
      alert("Đã xóa khách sạn.");
    } catch (err) {
      alert("Lỗi khi xóa: " + (err.response?.data?.msg || err.message));
    }
  };

  // --- 5. EDIT MODE ---
  const handleEditClick = (hotel) => {
    setEditingId(hotel.hotel_id);
    setForm({
      name: hotel.name,
      address: hotel.address,
      phone: hotel.phone,
    });
    window.scrollTo(0, 0);
  };

  // --- 6. CANCEL ---
  const handleCancel = () => {
    setEditingId(null);
    setForm({
      name: "",
      address: "",
      phone: "",
    });
  };

  // --- HÀM ĐIỀU HƯỚNG ĐẾN TRANG CHI TIẾT ---
  const handleViewDetail = (id) => {
    navigate(`/admin/hotels/${id}`);
  };

  if (loading) return <div><Header /> <p style={{padding: 20}}>Đang tải dữ liệu...</p></div>;

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{textAlign: "center", color: "#2c3e50"}}>Quản lý Khách sạn (Admin)</h2>
        
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {/* --- FORM SECTION --- */}
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
          <h3 style={{marginTop: 0}}>
            {editingId ? `Chỉnh sửa Khách sạn #${editingId}` : "Thêm Khách sạn mới"}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ flex: "1 1 300px" }}>
              <label>Tên Khách sạn:</label>
              <input style={{ width: "100%", padding: "8px" }} name="name" value={form.name} onChange={handleChange} placeholder="VD: Grand Hotel Saigon" required />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <label>Số điện thoại:</label>
              <input style={{ width: "100%", padding: "8px" }} name="phone" value={form.phone} onChange={handleChange} placeholder="VD: 0909 123 456" required />
            </div>
            <div style={{ flex: "1 1 100%" }}>
              <label>Địa chỉ:</label>
              <input style={{ width: "100%", padding: "8px" }} name="address" value={form.address} onChange={handleChange} placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" required />
            </div>
            <div style={{ width: "100%", marginTop: "10px" }}>
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: editingId ? "#f39c12" : "#27ae60", color: "white", border: "none", cursor: "pointer", marginRight: "10px" }}>
                {editingId ? "Lưu thay đổi" : "Thêm Khách sạn"}
              </button>
              <button type="button" onClick={handleCancel} style={{ padding: "10px 20px", cursor: "pointer" }}>Hủy / Reset</button>
            </div>
          </form>
        </div>

        {/* --- TABLE SECTION --- */}
        <h3>Danh sách Khách sạn hiện có ({hotels.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead style={{ backgroundColor: "#34495e", color: "white" }}>
              <tr>
                <th>ID</th>
                <th>Tên Khách sạn</th>
                <th>Địa chỉ</th>
                <th>Số điện thoại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {hotels.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: "center"}}>Chưa có khách sạn nào.</td></tr>
              ) : (
                  hotels.map((h) => (
                    <tr key={h.hotel_id}>
                      <td style={{textAlign: "center", fontWeight: "bold"}}>#{h.hotel_id}</td>
                      
                      {/* ✅ SỬA: Thêm onClick vào Tên Khách Sạn để chuyển hướng */}
                      <td 
                        style={{cursor: "pointer", color: "#2980b9", textDecoration: "underline"}}
                        onClick={() => handleViewDetail(h.hotel_id)}
                        title="Nhấp để xem chi tiết"
                      >
                        <b style={{fontSize: "1.1em"}}>{h.name}</b>
                      </td>

                      <td>{h.address}</td>
                      <td>{h.phone}</td>
                      <td style={{textAlign: "center", minWidth: "120px"}}>
                        <button onClick={() => handleEditClick(h)} style={{ marginRight: "8px", cursor: "pointer", color: "blue" }}>Sửa</button>
                        <button onClick={() => handleDelete(h.hotel_id)} style={{ color: "red", cursor: "pointer" }}>Xóa</button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default HotelManagement;