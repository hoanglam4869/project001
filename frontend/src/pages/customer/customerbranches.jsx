import React, { useEffect, useState } from "react";
import "../../css/branches.scss";
import API from "../../api/api.js";
import Header from "../../components/header";

const CustomerBranches = () => {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [services, setServices] = useState([]);

  // Lấy danh sách chi nhánh
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get("/api/hotels");
        setBranches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Không thể tải danh sách chi nhánh");
      }
    };
    fetchBranches();
  }, []);

  // Khi chọn chi nhánh
  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    try {
      const roomRes = await API.get(`/api/roomtypes?hotel_id=${hotel.hotel_id}`);
      const serviceRes = await API.get(`/api/services?hotel_id=${hotel.hotel_id}`);
      setRoomTypes(Array.isArray(roomRes.data) ? roomRes.data : []);
      setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
    } catch (err) {
      console.error("Fetch room/services error:", err);
      setRoomTypes([]);
      setServices([]);
    }
  };

  return (
    <div>
      <Header />
      <div className="branches-container">
        {/* Sidebar */}
        <div className="branches-sidebar">
          <h2>Danh sách chi nhánh</h2>
          {error && <p className="error">{error}</p>}
          <ul>
            {branches.map((b) => (
              <li
                key={b.hotel_id}
                onClick={() => handleSelectHotel(b)}
                className={selectedHotel?.hotel_id === b.hotel_id ? "active" : ""}
              >
                <strong>{b.name}</strong>
                <p>{b.address}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Nội dung chính */}
        <div className="branches-content">
          {!selectedHotel ? (
            <div className="placeholder">
              <h3>Hãy chọn một chi nhánh để xem phòng và dịch vụ</h3>
            </div>
          ) : (
            <>
              <div className="hotel-header">
                <h2>{selectedHotel.name}</h2>
                <p>{selectedHotel.address}</p>
              </div>

              {/* Phòng */}
              <section className="room-section">
                <h3>Loại phòng</h3>
                {roomTypes.length > 0 ? (
                  <div className="room-grid">
                    {roomTypes.map((r) => (
                      <div key={r.id} className="room-card">
                        <div className="room-info">
                          <h4>{r.name}</h4>
                          <p className="desc">{r.description}</p>
                          <p className="price">{r.price.toLocaleString()} VND</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có loại phòng nào.</p>
                )}
              </section>

              {/* Dịch vụ */}
              <section className="service-section">
                <h3>Dịch vụ</h3>
                {services.length > 0 ? (
                  <div className="service-grid">
                    {services.map((s) => (
                      <div key={s.id} className="service-card">
                        <div className="service-info">
                          <h4>{s.name}</h4>
                          <p className="desc">{s.description}</p>
                          <p className="price">{s.price.toLocaleString()} VND</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có dịch vụ nào.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerBranches;
