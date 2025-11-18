import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";

const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State cho Form
  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    furniture: "",
    price: 0,
    capacity: 1,
  });
  const [isEditing, setIsEditing] = useState(false);

  // Lấy hotel_id từ Token hoặc User
  const getHotelId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      // Giải mã payload token để lấy hotel_id chính xác
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.hotel_id;
    } catch (e) {
      return null;
    }
  };
  
  const hotelId = getHotelId();

  // 1. Lấy danh sách loại phòng
  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      if (!hotelId) throw new Error("Không tìm thấy thông tin khách sạn");

      const res = await API.get("/api/roomtypes", {
        params: { hotel_id: hotelId }
      });
      setRoomTypes(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi tải danh sách loại phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  // 2. Xử lý Input Form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Reset Form
  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      description: "",
      furniture: "",
      price: 0,
      capacity: 1,
    });
    setIsEditing(false);
  };

  // 4. Chọn phòng để sửa
  const handleEdit = (room) => {
    setForm({
      id: room.room_type_id || room.id, // Tùy thuộc vào response backend trả về id hay room_type_id
      name: room.name,
      description: room.description,
      furniture: room.furniture,
      price: room.price,
      capacity: room.capacity,
    });
    setIsEditing(true);
  };

  // 5. Submit Form (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hotelId) return alert("Lỗi phiên đăng nhập");

    try {
      if (isEditing) {
        // Cập nhật
        await API.put(`/api/roomtypes/${form.id}`, {
          ...form,
          hotel_id: hotelId,
        });
        alert("Cập nhật thành công!");
      } else {
        // Tạo mới
        await API.post("/api/roomtypes", {
          ...form,
          hotel_id: hotelId,
        });
        alert("Tạo loại phòng thành công!");
      }
      
      resetForm();
      fetchRoomTypes(); // Tải lại danh sách
    } catch (err) {
      alert(err.response?.data?.msg || "Có lỗi xảy ra");
    }
  };

  // 6. Xóa loại phòng
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) return;

    try {
      await API.delete(`/api/roomtypes/${id}`);
      alert("Đã xóa thành công");
      fetchRoomTypes();
    } catch (err) {
      alert(err.response?.data?.msg || "Lỗi khi xóa");
    }
  };

  if (loading) return <div><Header />Đang tải...</div>;

  return (
    <>
      <Header />
      <div style={{ padding: 20 }}>
        <h2>Quản lý Loại Phòng (Manager)</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* FORM NHẬP LIỆU */}
        <div style={{ marginBottom: 30, padding: 15, border: "1px solid #ccc" }}>
          <h3>{isEditing ? "Cập nhật Loại Phòng" : "Thêm Loại Phòng Mới"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <input 
                name="name" 
                placeholder="Tên loại phòng" 
                value={form.name} 
                onChange={handleChange} 
                required 
                style={{ marginRight: 10, padding: 5 }}
              />
              <input 
                name="price" 
                type="number" 
                placeholder="Giá (VND)" 
                value={form.price} 
                onChange={handleChange} 
                required 
                style={{ marginRight: 10, padding: 5 }}
              />
              <input 
                name="capacity" 
                type="number" 
                placeholder="Tổng số phòng" 
                value={form.capacity} 
                onChange={handleChange} 
                required 
                style={{ padding: 5 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input 
                name="furniture" 
                placeholder="Nội thất (giường, tủ...)" 
                value={form.furniture} 
                onChange={handleChange} 
                style={{ width: "100%", padding: 5, marginBottom: 5 }}
              />
              <textarea 
                name="description" 
                placeholder="Mô tả chi tiết" 
                value={form.description} 
                onChange={handleChange} 
                style={{ width: "100%", padding: 5 }}
              />
            </div>
            
            <button type="submit" style={{ padding: "5px 15px", marginRight: 5 }}>
              {isEditing ? "Lưu Thay Đổi" : "Thêm Mới"}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} style={{ padding: "5px 15px" }}>
                Hủy
              </button>
            )}
          </form>
        </div>

        {/* BẢNG DANH SÁCH */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
              <th style={styles.th}>Tên</th>
              <th style={styles.th}>Giá</th>
              <th style={styles.th}>Tổng số phòng</th>
              <th style={styles.th}>Nội thất</th>
              <th style={styles.th}>Mô tả</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {roomTypes.map((room) => (
              <tr key={room.room_type_id || room.id} style={styles.tr}>
                <td style={styles.td}>{room.name}</td>
                <td style={styles.td}>{Number(room.price).toLocaleString()} VND</td>
                <td style={styles.td}>{room.capacity}</td>
                <td style={styles.td}>{room.furniture}</td>
                <td style={styles.td}>{room.description}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(room)} style={{ marginRight: 5 }}>Sửa</button>
                  <button onClick={() => handleDelete(room.room_type_id || room.id)} style={{ color: "red" }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const styles = {
  th: { padding: "10px", border: "1px solid #ddd" },
  td: { padding: "10px", border: "1px solid #ddd" },
  tr: { borderBottom: "1px solid #ddd" },
};

export default RoomTypeManagement;