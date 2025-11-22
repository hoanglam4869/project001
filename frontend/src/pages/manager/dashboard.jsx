import React from "react";
import Header from "../../components/header.jsx";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { useManagerDashboard } from "../../hooks/useDashboard"; // Import hook SWR

const ManagerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const hotelId = user.hotel_id;

  // Sử dụng Hook SWR để lấy dữ liệu realtime
  const { data, isLoading, isError } = useManagerDashboard(hotelId);

  if (isLoading) return <div><Header /><p style={{padding: 20}}>Đang tải dữ liệu kinh doanh...</p></div>;
  if (isError) return <div><Header /><p style={{padding: 20}}>Lỗi tải dữ liệu.</p></div>;
  if (!data) return <div><Header /><p style={{padding: 20}}>Chưa có dữ liệu.</p></div>;

  // Màu cho biểu đồ tròn
  const PIE_COLORS = ['#0088FE', '#00C49F']; // Xanh dương (Room), Xanh lá (Service)

  return (
    <>
      <Header />
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px"}}>
            <h2 style={{ color: "#34495e", margin: 0 }}>Dashboard Quản Lý (Manager)</h2>
            <span style={{fontSize: '12px', color: '#7f8c8d', display: 'flex', alignItems: 'center'}}>
                <span style={{display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#2ecc71', borderRadius: '50%', marginRight: '5px'}}></span>
                Cập nhật tự động
            </span>
        </div>

        {/* --- 1. KPI CARDS --- */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
            <KPICard 
                title="Doanh thu tháng này" 
                value={`${parseInt(data.kpi.revenue).toLocaleString()} đ`}
                sub={`Tháng trước: ${parseInt(data.kpi.revenueLastMonth).toLocaleString()} đ`}
                color="#2ecc71"
            />
            <KPICard 
                title="Tổng Booking" 
                value={data.kpi.totalBookings} 
                sub="Đơn đặt phòng mới"
                color="#3498db"
            />
            <KPICard 
                title="Chi phí Voucher" 
                value={`${parseInt(data.kpi.voucherCost).toLocaleString()} đ`} 
                sub="Tiền giảm giá"
                color="#e74c3c"
            />
        </div>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            
            {/* --- 2. DOANH THU THEO NGÀY (AREA CHART) --- */}
            <div style={{ flex: 2, minWidth: "500px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3>Biểu đồ doanh thu (30 ngày qua)</h3>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data.charts.dailyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(tick) => tick.substring(5)} />
                            <YAxis tickFormatter={(val) => `${val/1000000}M`} />
                            <Tooltip formatter={(val) => parseInt(val).toLocaleString() + " đ"} />
                            <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- 3. CƠ CẤU NGUỒN THU (PIE CHART) --- */}
            <div style={{ flex: 1, minWidth: "300px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3>Nguồn doanh thu</h3>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data.charts.revenueSplit}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.charts.revenueSplit.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => parseInt(val).toLocaleString() + " đ"} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* --- 4. TOP DỊCH VỤ (BAR CHART NGANG) --- */}
        <div style={{ marginTop: "30px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3>Top 5 Dịch vụ bán chạy</h3>
            <div style={{ height: 300 }}>
                <ResponsiveContainer>
                    <BarChart layout="vertical" data={data.charts.topServices} margin={{left: 50}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(val) => val + " lượt"} />
                        <Bar dataKey="count" fill="#ff7300" barSize={20} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </>
  );
};

const KPICard = ({ title, value, sub, color }) => (
    <div style={{ 
        flex: 1, minWidth: "250px", 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "8px", 
        borderLeft: `5px solid ${color}`,
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }}>
        <div style={{color: "#7f8c8d", fontSize: "14px", textTransform: "uppercase"}}>{title}</div>
        <div style={{fontSize: "28px", fontWeight: "bold", margin: "10px 0", color: "#2c3e50"}}>{value}</div>
        <div style={{fontSize: "13px", color: "#95a5a6"}}>{sub}</div>
    </div>
);

export default ManagerDashboard;