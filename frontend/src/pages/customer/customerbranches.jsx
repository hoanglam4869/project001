// CustomerBranches.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api.js"; // axios instance có interceptor

const CustomerBranches = () => {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await API.get("/api/hotels"); 
        // axios sẽ tự động gắn Authorization: Bearer token

        console.log("Hotels API response:", res.data);

        // Kiểm tra dữ liệu trả về
        if (Array.isArray(res.data)) {
          setBranches(res.data);
        } else if (res.data.data && Array.isArray(res.data.data)) {
          setBranches(res.data.data);
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Danh sách chi nhánh</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {Array.isArray(branches) && branches.length > 0 ? (
          branches.map((b) => (
            <li key={b.hotel_id}>
              <strong>{b.name}</strong> - {b.address}
            </li>
          ))
        ) : (
          <p>Không có chi nhánh nào</p>
        )}
      </ul>
    </div>
  );
};

export default CustomerBranches;
