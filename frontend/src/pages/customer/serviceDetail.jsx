import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api.js";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

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

  if (error) return <p>{error}</p>;
  if (!service) return <p>Đang tải...</p>;

  return (
    <div className="detail-page">
      <h2>{service.name}</h2>
      <p>{service.description}</p>
      <p><strong>Giá:</strong> {parseFloat(service.price).toLocaleString()} VND</p>
      <Link to="/customer/branches">
        <button>← Quay lại</button>
      </Link>
    </div>
  );
};

export default ServiceDetail;
