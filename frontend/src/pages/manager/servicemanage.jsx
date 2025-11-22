import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import { useNavigate } from "react-router-dom";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Lấy thông tin user để biết hotel_id
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const hotelId = user.hotel_id;

  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // --- 1. LOAD DANH SÁCH SERVICES ---
  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập.");
        setLoading(false);
        navigate("/auth/login");
        return;
      }

      try {
        // 🌟 SỬA: Truyền hotel_id vào params vì API giờ là Public và cần lọc thủ công
        const res = await API.get("/api/services", {
          params: { hotel_id: hotelId }, 
          headers: { Authorization: `Bearer ${token}` }, // Vẫn gửi token cũng không sao
        });

        if (Array.isArray(res.data)) {
            setServices(res.data);
        } else {
            setServices([]);
        }
      } catch (err) {
        setError(err.response?.data?.msg || "Lỗi khi tải danh sách dịch vụ.");
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
        fetchServices();
    } else {
        setLoading(false);
        setError("Tài khoản Manager chưa được gán Khách sạn.");
    }
  }, [navigate, hotelId]);

  // --- 2. HANDLE INPUT ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- 3. SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setError("");

    const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price)
    };

    try {
      if (editingId) {
        // UPDATE
        const res = await API.put(`/api/services/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices((prev) =>
          prev.map((s) => (s.service_id === editingId ? res.data : s))
        );
        alert("Cập nhật thành công!");
      } else {
        // CREATE
        const res = await API.post("/api/services", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices([...services, res.data]);
        alert("Thêm mới thành công!");
      }
      handleCancel();
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.msg || "Server Error"));
    }
  };

  // --- 4. DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
    const token = localStorage.getItem("token");
    try {
      await API.delete(`/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.filter((s) => s.service_id !== id));
      alert("Đã xóa dịch vụ.");
    } catch (err) {
      alert("Lỗi xóa: " + (err.response?.data?.msg || err.message));
    }
  };

  // --- 5. EDIT SETUP ---
  const handleEditClick = (service) => {
    setEditingId(service.service_id);
    setForm({
      name: service.name,
      price: service.price,
      description: service.description || "",
    });
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "" });
  };

  if (loading) return <div><Header /> <p style={{padding: 20}}>Đang tải...</p></div>;
  if (error) return <div><Header /> <p style={{padding: 20, color: 'red'}}>{error}</p></div>;

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{textAlign: "center", color: "#2c3e50"}}>Quản lý Dịch vụ (Manager)</h2>

        {/* FORM */}
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", backgroundColor: "#f9f9f9", marginBottom: "30px" }}>
          <h3 style={{marginTop: 0}}>{editingId ? `Sửa Dịch vụ #${editingId}` : "Thêm Dịch vụ Mới"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ flex: "1 1 300px" }}>
              <label>Tên dịch vụ:</label>
              <input style={{ width: "100%", padding: "8px" }} name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <label>Giá (VND):</label>
              <input style={{ width: "100%", padding: "8px" }} type="number" name="price" value={form.price} onChange={handleChange} required />
            </div>
            <div style={{ flex: "1 1 100%" }}>
              <label>Mô tả chi tiết:</label>
              <textarea style={{ width: "100%", padding: "8px" }} name="description" value={form.description} onChange={handleChange} rows="3" />
            </div>
            <div style={{ width: "100%", marginTop: "10px" }}>
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: editingId ? "#f39c12" : "#27ae60", color: "white", border: "none", cursor: "pointer", marginRight: "10px" }}>
                {editingId ? "Lưu thay đổi" : "Thêm Dịch vụ"}
              </button>
              <button type="button" onClick={handleCancel} style={{ padding: "10px 20px", cursor: "pointer" }}>Hủy</button>
            </div>
          </form>
        </div>

        {/* TABLE */}
        <h3>Danh sách Dịch vụ ({services.length})</h3>
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead style={{ backgroundColor: "#34495e", color: "white" }}>
              <tr><th>ID</th><th>Tên Dịch vụ</th><th>Mô tả</th><th>Giá (VND)</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {Array.isArray(services) && services.length > 0 ? (
                  services.map((s) => (
                    <tr key={s.service_id}>
                      <td style={{textAlign: "center"}}>#{s.service_id}</td>
                      <td><b>{s.name}</b></td>
                      <td>{s.description || "-"}</td>
                      <td style={{textAlign: "right", fontWeight: "bold", color: "#d35400"}}>{parseInt(s.price).toLocaleString()}</td>
                      <td style={{textAlign: "center", minWidth: "120px"}}>
                        <button onClick={() => handleEditClick(s)} style={{ marginRight: "8px", cursor: "pointer", color: "blue" }}>Sửa</button>
                        <button onClick={() => handleDelete(s.service_id)} style={{ color: "red", cursor: "pointer" }}>Xóa</button>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr><td colSpan="5" style={{textAlign: "center"}}>Chưa có dịch vụ nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ServiceManagement;