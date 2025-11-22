import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "customer", hotel_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingOriginalRole, setEditingOriginalRole] = useState(null);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || currentUser.role !== "admin") {
        alert("Bạn không có quyền truy cập trang này!");
        navigate("/");
        return;
      }
      try {
        const [resUsers, resHotels] = await Promise.all([
            API.get("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
            API.get("/api/hotels", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUsers(resUsers.data.sort((a, b) => b.user_id - a.user_id));
        setHotels(resHotels.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // --- 2. HANDLE CHANGE ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    if (!editingId && name === "role") {
        if (value === "customer" || value === "admin") {
            updatedForm.hotel_id = "";
        }
    }
    setForm(updatedForm);
  };

  // --- 3. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setError("");

    if (!editingId && (!form.name || !form.email || !form.password)) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const payload = {
        name: form.name, email: form.email, role: form.role,
        hotel_id: form.hotel_id ? parseInt(form.hotel_id) : null,
    };
    if (!editingId) payload.password = form.password;

    try {
      if (editingId) {
        const res = await API.put(`/api/users/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.map((u) => (u.user_id === editingId ? res.data.user : u)));
        alert("Cập nhật thành công!");
      } else {
        const res = await API.post("/api/users", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.user) setUsers([res.data.user, ...users]);
        alert("Tạo tài khoản thành công!");
      }
      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.msg || "Server Error"));
    }
  };

  // --- 4. DELETE ---
  const handleDelete = async (id) => {
    if (id === currentUser.user_id) {
        alert("Bạn không thể xóa chính mình!");
        return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    const token = localStorage.getItem("token");
    try {
      await API.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter((u) => u.user_id !== id));
      alert("Đã xóa tài khoản.");
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.msg || err.message));
    }
  };

  // --- 5. EDIT SETUP ---
  const handleEditClick = (user) => {
    setEditingId(user.user_id);
    setEditingOriginalRole(user.role);
    setForm({
      name: user.name, email: user.email, password: "", role: user.role, hotel_id: user.hotel_id || "",
    });
    window.scrollTo(0, 0);
  };

  // --- 6. CANCEL ---
  const handleCancel = () => {
    setEditingId(null);
    setEditingOriginalRole(null);
    setForm({ name: "", email: "", password: "", role: "customer", hotel_id: "" });
  };

  // --- VIEW DETAIL ---
  const handleViewDetail = (id) => {
      navigate(`/admin/users/${id}`);
  };

  const isRestrictedEdit = editingId && (editingOriginalRole === 'customer' || editingOriginalRole === 'admin');
  const isStaffManagerEdit = editingId && (editingOriginalRole === 'staff' || editingOriginalRole === 'manager');
  const isCreateHotelDisabled = !editingId && (form.role === 'customer' || form.role === 'admin');

  if (loading) return <div><Header /> <p style={{padding: 20}}>Đang tải dữ liệu...</p></div>;

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{textAlign: "center", color: "#2c3e50"}}>Quản lý Tài khoản (Admin)</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
          <h3 style={{marginTop: 0}}>{editingId ? `Chỉnh sửa User #${editingId}` : "Thêm User mới"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ flex: "1 1 300px" }}>
              <label>Tên hiển thị:</label>
              <input style={{ width: "100%", padding: "8px" }} name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <label>Email:</label>
              <input style={{ width: "100%", padding: "8px" }} type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            {!editingId && (
                <div style={{ flex: "1 1 300px" }}>
                <label>Mật khẩu:</label>
                <input style={{ width: "100%", padding: "8px" }} type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Nhập mật khẩu..." />
                </div>
            )}
            {isRestrictedEdit && <div style={{width: '100%', color: '#e67e22', fontStyle: 'italic'}}>* Đối với Customer và Admin, chỉ được phép chỉnh sửa Tên và Email.</div>}
            {(!editingId || isStaffManagerEdit) && (
                <>
                    <div style={{ flex: "1 1 300px" }}>
                    <label>Vai trò (Role):</label>
                    <select style={{ width: "100%", padding: "8px" }} name="role" value={form.role} onChange={handleChange}>
                        {!isStaffManagerEdit && <option value="customer">Customer (Khách hàng)</option>}
                        {!isStaffManagerEdit && <option value="admin">Admin</option>}
                        <option value="staff">Staff (Nhân viên)</option>
                        <option value="manager">Manager (Quản lý)</option>
                    </select>
                    </div>
                    <div style={{ flex: "1 1 300px" }}>
                    <label>Phân công Khách sạn:</label>
                    <select style={{ width: "100%", padding: "8px", backgroundColor: isCreateHotelDisabled ? "#e9ecef" : "#fff" }} name="hotel_id" value={form.hotel_id} onChange={handleChange} disabled={isCreateHotelDisabled}>
                        <option value="">-- Không trực thuộc --</option>
                        {hotels.map(h => (<option key={h.hotel_id} value={h.hotel_id}>{h.name}</option>))}
                    </select>
                    </div>
                </>
            )}
            <div style={{ width: "100%", marginTop: "10px" }}>
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: editingId ? "#f39c12" : "#27ae60", color: "white", border: "none", cursor: "pointer", marginRight: "10px" }}>{editingId ? "Lưu thay đổi" : "Tạo tài khoản"}</button>
              <button type="button" onClick={handleCancel} style={{ padding: "10px 20px", cursor: "pointer" }}>Hủy / Reset</button>
            </div>
          </form>
        </div>

        {/* --- TABLE --- */}
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead style={{ backgroundColor: "#34495e", color: "white" }}>
              <tr><th>ID</th><th>Tên</th><th>Email</th><th>Vai trò</th><th>Khách sạn</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isCurrentUser = u.user_id === currentUser.user_id;
                return (
                    <tr key={u.user_id} style={{backgroundColor: isCurrentUser ? "#f0f8ff" : "white"}}>
                      <td style={{textAlign: "center"}}>{u.user_id}</td>
                      
                      {/* ✅ SỬA: Thêm onClick vào Tên User để chuyển hướng */}
                      <td 
                        style={{cursor: "pointer", color: "#2980b9", textDecoration: "underline"}}
                        onClick={() => handleViewDetail(u.user_id)}
                        title="Xem chi tiết người dùng"
                      >
                        {u.name} {isCurrentUser && <b style={{color:'green'}}>(Bạn)</b>}
                      </td>

                      <td>{u.email}</td>
                      <td style={{textAlign: "center"}}>
                        <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", color: "white", backgroundColor: u.role === "admin" ? "#c0392b" : u.role === "manager" ? "#e67e22" : u.role === "staff" ? "#2980b9" : "#95a5a6" }}>{u.role.toUpperCase()}</span>
                      </td>
                      <td style={{textAlign: "center"}}>{u.Hotel ? <b>{u.Hotel.name}</b> : "-"}</td>
                      <td style={{textAlign: "center"}}>
                        <button onClick={() => handleEditClick(u)} style={{ marginRight: "5px", color: "blue", cursor: "pointer" }}>Sửa</button>
                        <button onClick={() => handleDelete(u.user_id)} disabled={isCurrentUser} style={{ color: isCurrentUser ? "#ccc" : "red", cursor: isCurrentUser ? "not-allowed" : "pointer" }}>Xóa</button>
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UserManagement;