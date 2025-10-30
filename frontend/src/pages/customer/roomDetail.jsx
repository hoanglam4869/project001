import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header";

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await API.get(`/api/roomtypes/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin phòng");
      }
    };
    fetchRoom();
  }, [id]);

  const addToBooking = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userKey = user ? `bookingItems_${user.user_id}` : "bookingItems_guest";

    let booking = JSON.parse(localStorage.getItem(userKey)) || [];
    const item = {
      type: "room",
      id: room.id,
      name: room.name,
      price: room.price,
      quantity: 1,
    };
    booking.push(item);
    localStorage.setItem(userKey, JSON.stringify(booking));
    setMessage("✅ Đã thêm phòng vào danh sách đặt!");
    console.log("Giỏ đặt hiện tại:", booking);
  };

  if (error) return <p>{error}</p>;
  if (!room) return <p>Đang tải...</p>;

  return (
    <>
    <Header/>
    <div className="detail-page">
      <h2>{room.name}</h2>
      <p>{room.description}</p>
      <p><strong>Nội thất:</strong> {room.furniture}</p>
      <p><strong>Sức chứa:</strong> {room.capacity} người</p>
      <p><strong>Còn trống:</strong> {room.available}</p>
      <p><strong>Giá:</strong> {parseFloat(room.price).toLocaleString()} VND</p>

      <button onClick={addToBooking}>🛒 Thêm vào danh sách đặt</button>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <Link to="/customer/branches">
        <button>← Quay lại</button>
      </Link>
    </div>
    </>
  );
};

export default RoomDetail;
