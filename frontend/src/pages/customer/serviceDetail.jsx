import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api.js";
import Header from "../../components/header";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await API.get(`/api/services/${id}`);
        setService(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin dịch vụ");
      }
    };
    fetchService();
  }, [id]);

  const addToBooking = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userKey = user ? `bookingItems_${user.user_id}` : "bookingItems_guest";

    let booking = JSON.parse(localStorage.getItem(userKey)) || [];
    const item = {
      type: "service",
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
    };
    booking.push(item);
    localStorage.setItem(userKey, JSON.stringify(booking));
    setMessage("✅ Đã thêm dịch vụ vào danh sách đặt!");
    console.log("Giỏ đặt hiện tại:", booking);
  };

  if (error) return <p>{error}</p>;
  if (!service) return <p>Đang tải...</p>;

  return (
    <>
    <Header/>
    <div className="detail-page">
      <h2>{service.name}</h2>
      <p>{service.description}</p>
      <p><strong>Giá:</strong> {parseFloat(service.price).toLocaleString()} VND</p>

      <button onClick={addToBooking}>🛒 Thêm vào danh sách đặt</button>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <Link to="/customer/branches">
        <button>← Quay lại</button>
      </Link>
    </div>
    </>
  );
};

export default ServiceDetail;
