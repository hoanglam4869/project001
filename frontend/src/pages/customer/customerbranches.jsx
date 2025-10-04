// CustomerBranches.jsx
import React, { useEffect, useState } from "react";
import "../../css/branches.scss"
import API from "../../api/api.js"; // axios instance có interceptor
import Header from "../../components/header"; // ✅ thêm dòng này
import hotel from "../../assets/hotel.png";
import room from "../../assets/room.png";


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
      <Header /> {/* ✅ hiển thị header ở đầu trang */}
      <div className="container">
        <div className="container-left">
          <h3>Filter search</h3>
          <div className="branch">
            <img src={hotel} alt="Hotel"/>
            <p>Branch</p>
          </div>
          
          <ul>
            <li>Da Nang</li>
            <li>Hai Phong</li>
            <li>Ha Noi</li>
          </ul>
        </div>
        <div className="container-right">
          <div className="top">
            <div className="top-left">
              <p>Sort by price</p>
              <ul>
                <li>Low to high</li>
                <li>High to low</li>
              </ul>
            </div>
            <div className="top-right">
              <p>Search by name</p>
              <input type="text"></input>
              <button>Search</button>
            </div>
          </div>
          <div className="bottom">
            <ul className="room">
              <li>
                <ul className="room-slot">
                  <li className="room-slot-pic"><img src={room} alt="Hotline"/></li>
                  <li className="room-slot-name">Best Western Orlando Gateway Hotel  </li>
                  <li className="room-slot-price">1000</li>
                  <li className="room-slot-review">5.0</li>
                  <li className="room-slot-address">Address</li>
                  <li className="room-slot-branch">Branch</li>
                </ul>
              </li>
              <li>
                <ul className="room-slot">
                  <li className="room-slot-pic"><img src={room} alt="Hotline"/></li>
                  <li className="room-slot-name">Best Western Orlando Gateway Hotel  </li>
                  <li className="room-slot-price">1000</li>
                  <li className="room-slot-review">5.0</li>
                  <li className="room-slot-address">Address</li>
                  <li className="room-slot-branch">Branch</li>
                </ul>
              </li>
              <li>
                <ul className="room-slot">
                  <li className="room-slot-pic"><img src={room} alt="Hotline"/></li>
                  <li className="room-slot-name">Best Western Orlando Gateway Hotel  </li>
                  <li className="room-slot-price">1000</li>
                  <li className="room-slot-review">5.0</li>
                  <li className="room-slot-address">Address</li>
                  <li className="room-slot-branch">Branch</li>
                </ul>
              </li>
              <li>
                <ul className="room-slot">
                  <li className="room-slot-pic"><img src={room} alt="Hotline"/></li>
                  <li className="room-slot-name">Best Western Orlando Gateway Hotel  </li>
                  <li className="room-slot-price">1000</li>
                  <li className="room-slot-review">5.0</li>
                  <li className="room-slot-address">Address</li>
                  <li className="room-slot-branch">Branch</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

      </div>


    </div>
  );
};

export default CustomerBranches;
