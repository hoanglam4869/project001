import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import { useNavigate } from "react-router-dom";

// Helper format ngày hiển thị (DD/MM/YYYY)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("vi-VN", options);
};

// Helper format ngày cho input type="date" (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // State cho Form
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "percent", // mặc định là phần trăm
    voucher_value: "",
    start_date: "",
    end_date: "",
  });
  const [editingId, setEditingId] = useState(null); // Nếu null => Tạo mới, Nếu có ID => Đang sửa

  // 1. Load danh sách Voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Không có token. Vui lòng đăng nhập lại.");
        setLoading(false);
        navigate("/auth/login");
        return;
      }

      try {
        const res = await API.get("/api/vouchers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sắp xếp mới nhất lên đầu
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setVouchers(sorted);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Bạn không có quyền truy cập trang này.");
        } else {
          setError(err.response?.data?.msg || "Lỗi khi tải danh sách voucher.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [navigate]);

  // 2. Xử lý thay đổi input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Submit Form (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Validate cơ bản
    if (new Date(form.start_date) > new Date(form.end_date)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    try {
      if (editingId) {
        // --- UPDATE ---
        const res = await API.put(`/api/vouchers/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Cập nhật list local
        setVouchers((prev) =>
          prev.map((v) => (v.voucher_id === editingId ? res.data : v))
        );
        alert("Cập nhật voucher thành công!");
      } else {
        // --- CREATE ---
        const res = await API.post("/api/vouchers", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Thêm vào đầu list
        setVouchers([res.data, ...vouchers]);
        alert("Tạo voucher mới thành công!");
      }

      // Reset form về mặc định
      handleCancelEdit();

    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.msg || err.message));
    }
  };

  // 4. Xử lý khi bấm nút Sửa (Đổ dữ liệu lên form)
  const handleEditClick = (voucher) => {
    setEditingId(voucher.voucher_id);
    setForm({
      name: voucher.name,
      description: voucher.description || "",
      type: voucher.type,
      voucher_value: voucher.voucher_value,
      start_date: formatDateForInput(voucher.start_date),
      end_date: formatDateForInput(voucher.end_date),
    });
    // Cuộn lên đầu trang để thấy form
    window.scrollTo(0, 0);
  };

  // 5. Xử lý nút Hủy (Reset form)
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      type: "percent",
      voucher_value: "",
      start_date: "",
      end_date: "",
    });
  };

  // 6. Xử lý Xóa
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa Voucher này?")) return;

    const token = localStorage.getItem("token");
    try {
      await API.delete(`/api/vouchers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVouchers(vouchers.filter((v) => v.voucher_id !== id));
      alert("Đã xóa voucher.");
    } catch (err) {
      alert("Lỗi khi xóa: " + (err.response?.data?.msg || err.message));
    }
  };

  if (loading) return <div><Header />Đang tải dữ liệu...</div>;
  if (error) return <div><Header /><p style={{color: 'red'}}>{error}</p></div>;

  return (
    <>
      <Header />
      <div>
        <h2>Quản lý Voucher (Staff)</h2>

        {/* KHU VỰC FORM NHẬP LIỆU */}
        <div style={{ marginBottom: "30px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>{editingId ? `Đang sửa Voucher #${editingId}` : "Tạo Voucher Mới"}</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Tên Voucher: </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ví dụ: Giảm 10%"
              />
            </div>
            <br />
            <div>
              <label>Mô tả: </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn..."
              />
            </div>
            <br />
            <div>
              <label>Loại giảm giá: </label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="percent">Phần trăm (%)</option>
                <option value="amount">Số tiền (VND)</option>
              </select>
            </div>
            <br />
            <div>
              <label>Giá trị giảm: </label>
              <input
                type="number"
                name="voucher_value"
                value={form.voucher_value}
                onChange={handleChange}
                required
                placeholder={form.type === 'percent' ? "VD: 10" : "VD: 50000"}
              />
            </div>
            <br />
            <div>
              <label>Ngày bắt đầu: </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
              &nbsp; --- &nbsp;
              <label>Ngày kết thúc: </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
            <br />
            
            <button type="submit">
              {editingId ? "Lưu thay đổi" : "Tạo mới"}
            </button>
            
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ marginLeft: "10px" }}>
                Hủy bỏ
              </button>
            )}
          </form>
        </div>

        {/* KHU VỰC BẢNG DANH SÁCH */}
        <h3>Danh sách Voucher hiện có</h3>
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Thời hạn</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>Chưa có voucher nào</td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.voucher_id}>
                  <td>#{v.voucher_id}</td>
                  <td>
                    <b>{v.name}</b> <br/>
                    <small>{v.description}</small>
                  </td>
                  <td>
                    {v.type === "percent" ? "Phần trăm" : "Tiền mặt"}
                  </td>
                  <td>
                    {v.type === "percent"
                      ? `${v.voucher_value}%`
                      : `${parseInt(v.voucher_value).toLocaleString()} VND`}
                  </td>
                  <td>
                    Từ: {formatDate(v.start_date)} <br/>
                    Đến: {formatDate(v.end_date)}
                  </td>
                  <td>
                    <button onClick={() => handleEditClick(v)}>Sửa</button>
                    &nbsp;
                    <button onClick={() => handleDeleteClick(v.voucher_id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default VoucherManagement;