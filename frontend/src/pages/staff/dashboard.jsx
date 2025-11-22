import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Header from "../../components/header.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load dữ liệu
  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await API.get("/api/dashboard/staff", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Lỗi tải Dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div><Header /><p style={{padding: 20}}>Đang tải dữ liệu...</p></div>;
  if (error) return <div><Header /><p style={{padding: 20, color: 'red'}}>{error}</p></div>;
  if (!stats) return null;

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
        <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>Dashboard Vận Hành (Staff)</h2>

        {/* --- PHẦN 1: THẺ TRẠNG THÁI VẬN HÀNH (Operations) --- */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
          
          {/* Pending - Cần xử lý gấp */}
          <div style={cardStyle("#e74c3c")}>
            <h3>Đơn chờ duyệt</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.operations.pending}</div>
            <small>Cần xác nhận ngay</small>
          </div>

          {/* Arrivals - Khách đến */}
          <div style={cardStyle("#3498db")}>
            <h3>Khách sắp đến</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.operations.arrivals}</div>
            <small>Check-in hôm nay</small>
          </div>

          {/* Departures - Khách đi */}
          <div style={cardStyle("#f1c40f", "#333")}>
            <h3>Khách sắp đi</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.operations.departures}</div>
            <small>Check-out hôm nay</small>
          </div>

          {/* Staying - Đang ở */}
          <div style={cardStyle("#2ecc71")}>
            <h3>Đang lưu trú</h3>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.operations.staying}</div>
            <small>Phòng đang có khách</small>
          </div>
        </div>

        {/* --- CẢNH BÁO QUÁ HẠN --- */}
        {stats.operations.overdue > 0 && (
            <div style={{backgroundColor: "#ffebee", color: "#c62828", padding: "15px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #ef9a9a"}}>
                <strong>⚠️ CẢNH BÁO:</strong> Có <strong>{stats.operations.overdue}</strong> phòng quá hạn trả phòng (Overdue Checkout). Vui lòng kiểm tra ngay!
            </div>
        )}

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
            
            {/* --- PHẦN 2: CÔNG SUẤT PHÒNG (Occupancy) --- */}
            <div style={{ flex: 1, minWidth: "300px", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h3 style={{marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px"}}>Tình trạng phòng hôm nay</h3>
                
                <div style={{textAlign: "center", marginTop: "20px"}}>
                    <div style={{fontSize: "4rem", fontWeight: "bold", color: stats.occupancy.rate > 80 ? "#e74c3c" : "#2c3e50"}}>
                        {stats.occupancy.rate}%
                    </div>
                    <p style={{color: "#7f8c8d"}}>Tỷ lệ lấp đầy</p>
                </div>

                <div style={{marginTop: "30px"}}>
                    <div style={rowStyle}>
                        <span>Tổng số phòng:</span>
                        <strong>{stats.occupancy.totalRooms}</strong>
                    </div>
                    <div style={rowStyle}>
                        <span>Đã có khách:</span>
                        <strong style={{color: "#e74c3c"}}>{stats.occupancy.occupied}</strong>
                    </div>
                    <div style={rowStyle}>
                        <span>Phòng trống:</span>
                        <strong style={{color: "#27ae60"}}>{stats.occupancy.available}</strong>
                    </div>
                </div>
            </div>

            {/* --- PHẦN 4: BIỂU ĐỒ BOOKING TUẦN QUA --- */}
            <div style={{ flex: 2, minWidth: "400px", backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <h3 style={{marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px"}}>Lượng đặt phòng 7 ngày qua</h3>
                <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
                    <ResponsiveContainer>
                        <BarChart data={stats.chart}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{fontSize: 12}} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="bookings" fill="#3498db" name="Số lượng đặt" radius={[4, 4, 0, 0]}>
                                {stats.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 6 ? "#e67e22" : "#3498db"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

      </div>
    </>
  );
};

// CSS Styles Inline gọn nhẹ
const cardStyle = (bgColor, textColor = "white") => ({
    flex: 1,
    minWidth: "200px",
    backgroundColor: bgColor,
    color: textColor,
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    textAlign: "center"
});

const rowStyle = {
    display: "flex", 
    justifyContent: "space-between", 
    padding: "10px 0", 
    borderBottom: "1px dashed #eee"
};

export default StaffDashboard;