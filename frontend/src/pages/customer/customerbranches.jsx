// CustomerBranches.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api.js"; // axios instance có interceptor

const CustomerBranches = () => {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get("/api/hotels");
        if (Array.isArray(res.data)) {
          setBranches(res.data);
        } else {
          setBranches([]);
          setError("Invalid API response format");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Không thể tải danh sách chi nhánh");
      }
    };
    fetchBranches();
  }, []);

  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    try {
      // lấy room types
      const roomRes = await API.get(`/api/roomtypes?hotel_id=${hotel.hotel_id}`);
      // lấy services
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
      <h2>Danh sách chi nhánh</h2>
      {error && <p>{error}</p>}
      <ul>
        {branches.map((b) => (
          <li key={b.hotel_id}>
            <button onClick={() => handleSelectHotel(b)}>
              <strong>{b.name}</strong> - {b.address}
            </button>
          </li>
        ))}
      </ul>

      {selectedHotel && (
        <div>
          <h3>Chi nhánh: {selectedHotel.name}</h3>

          <h4>Loại phòng</h4>
          {roomTypes.length > 0 ? (
            <ul>
              {roomTypes.map((r) => (
                <li key={r.id}>
                  <strong>{r.name}</strong> - {r.price} VND
                  <br />
                  Sức chứa: {r.capacity} người
                  <br />
                  Nội thất: {r.furniture}
                  <br />
                  {r.description}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có loại phòng nào</p>
          )}

          <h4>Dịch vụ</h4>
          {services.length > 0 ? (
            <ul>
              {services.map((s) => (
                <li key={s.id}>
                  <strong>{s.name}</strong> - {s.price} VND
                  <br />
                  {s.description}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có dịch vụ nào</p>
          )}
        </div>
      )}
    </div>

  );
};

export default CustomerBranches;
