import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import userImg from "../../assets/user.jpg"; // Dùng lại ảnh user mặc định

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await API.get(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Lỗi khi tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [id, navigate]);

  if (loading) return <div><Header /><p style={{padding: 20}}>Đang tải...</p></div>;
  if (error) return <div><Header /><p style={{padding: 20, color: 'red'}}>{error}</p></div>;
  if (!user) return <div><Header /><p style={{padding: 20}}>Không tìm thấy dữ liệu.</p></div>;

  // Xác định màu sắc role
  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "#c0392b";
      case "manager": return "#e67e22";
      case "staff": return "#2980b9";
      default: return "#95a5a6"; // customer
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        
        <button 
          onClick={() => navigate("/admin/users")}
          style={{ marginBottom: "20px", padding: "5px 15px", cursor: "pointer" }}
        >
          &larr; Quay lại danh sách
        </button>

        <div style={{ 
            border: "1px solid #ddd", 
            borderRadius: "10px", 
            overflow: "hidden", 
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
        }}>
          {/* Banner màu theo role */}
          <div style={{ 
              height: "80px", 
              backgroundColor: getRoleColor(user.role),
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
          }}>
            <h2 style={{color: "white", margin: 0, textTransform: "uppercase"}}>{user.role} PROFILE</h2>
          </div>

          <div style={{ padding: "20px", textAlign: "center" }}>
            {/* Avatar */}
            <img 
                src={userImg} 
                alt="User Avatar" 
                style={{ 
                    width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", 
                    border: "4px solid white", marginTop: "-60px", backgroundColor: "white"
                }} 
            />
            
            <h2 style={{ margin: "10px 0 5px 0", color: "#333" }}>{user.name}</h2>
            <p style={{ color: "#666", margin: "0 0 20px 0" }}>{user.email}</p>

            <div style={{ textAlign: "left", marginTop: "20px", padding: "0 20px" }}>
                <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                    <strong>User ID:</strong>
                    <span>#{user.user_id}</span>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                    <strong>Vai trò hệ thống:</strong>
                    <span style={{
                        fontWeight: "bold", 
                        color: getRoleColor(user.role),
                        textTransform: "capitalize"
                    }}>
                        {user.role}
                    </span>
                </div>

                {/* Chỉ hiện khách sạn nếu là Staff/Manager */}
                {(user.role === "staff" || user.role === "manager") && (
                    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0'}}>
                        <strong>Đơn vị công tác:</strong>
                        {user.Hotel ? (
                            <span style={{fontWeight: "bold", color: "#27ae60"}}>
                                🏨 {user.Hotel.name}
                            </span>
                        ) : (
                            <span style={{color: "red", fontStyle: "italic"}}>Chưa phân công</span>
                        )}
                    </div>
                )}

                {(user.role === "staff" || user.role === "manager") && user.Hotel && (
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0'}}>
                        <strong>Địa chỉ làm việc:</strong>
                        <span style={{maxWidth: "60%", textAlign: "right", fontSize: "14px"}}>
                            {user.Hotel.address}
                        </span>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetail;