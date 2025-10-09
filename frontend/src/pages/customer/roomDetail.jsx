import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api.js";

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

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

  if (error) return <p>{error}</p>;
  if (!room) return <p>Đang tải...</p>;

  return (
    <div className="detail-page">
      <h2>{room.name}</h2>
      <p>{room.description}</p>
      <p><strong>Nội thất:</strong> {room.furniture}</p>
      <p><strong>Sức chứa:</strong> {room.capacity} người</p>
      <p><strong>Còn trống:</strong> {room.available}</p>
      <p><strong>Giá:</strong> {parseFloat(room.price).toLocaleString()} VND</p>
      <Link to="/customer/branches">
        <button>← Quay lại</button>
      </Link>
    </div>
  );
};

export default RoomDetail;
