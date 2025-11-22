import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";

const HotelDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotelDetail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        // Gọi API Get By ID vừa tạo
        const res = await API.get(`/api/hotels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotel(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Lỗi khi tải thông tin khách sạn.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [id, navigate]);

  if (loading) return <div><Header /><p style={{padding: 20}}>Đang tải...</p></div>;
  if (error) return <div><Header /><p style={{padding: 20, color: 'red'}}>{error}</p></div>;
  if (!hotel) return <div><Header /><p style={{padding: 20}}>Không tìm thấy dữ liệu.</p></div>;

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Nút Back */}
        <button 
          onClick={() => navigate("/admin/hotels")}
          style={{ marginBottom: "20px", padding: "5px 15px", cursor: "pointer" }}
        >
          &larr; Quay lại danh sách
        </button>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          
          {/* --- CỘT 1: THÔNG TIN CHUNG --- */}
          <div style={{ flex: 1, minWidth: "300px", border: "1px solid #ddd", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "#2c3e50", marginTop: 0 }}>{hotel.name}</h2>
            <p><strong>Mã khách sạn (ID):</strong> #{hotel.hotel_id}</p>
            <hr style={{ margin: "15px 0", border: "0", borderTop: "1px solid #eee" }} />
            
            <div style={{ marginBottom: "10px" }}>
              <strong>📍 Địa chỉ:</strong> <br/>
              <span style={{color: "#555"}}>{hotel.address}</span>
            </div>
            
            <div style={{ marginBottom: "10px" }}>
              <strong>📞 Số điện thoại:</strong> <br/>
              <span style={{color: "#555"}}>{hotel.phone}</span>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <strong>👥 Tổng nhân sự:</strong> <br/>
              <span style={{fontSize: "18px", fontWeight: "bold", color: "#2980b9"}}>
                {hotel.Users ? hotel.Users.length : 0} người
              </span>
            </div>
          </div>

          {/* --- CỘT 2: DANH SÁCH NHÂN VIÊN --- */}
          <div style={{ flex: 2, minWidth: "400px" }}>
            <h3 style={{ marginTop: 0 }}>Danh sách Nhân viên / Quản lý</h3>
            
            {hotel.Users && hotel.Users.length > 0 ? (
              <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
                <thead style={{ backgroundColor: "#34495e", color: "white" }}>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {hotel.Users.map((u) => (
                    <tr key={u.user_id}>
                      <td style={{textAlign: "center"}}>#{u.user_id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{textAlign: "center"}}>
                        <span style={{
                            padding: "3px 8px", borderRadius: "4px", fontSize: "12px", color: "white",
                            backgroundColor: u.role === "manager" ? "#e67e22" : "#2980b9"
                        }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontStyle: "italic", color: "#777" }}>Chưa có nhân viên nào được phân công vào khách sạn này.</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default HotelDetail;