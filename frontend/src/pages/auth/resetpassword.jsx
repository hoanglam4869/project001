import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

const ResetPassword = () => {
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const res = await API.post(`/api/auth/reset-password/${token}`, { newPassword });
      setMessage(res.data.msg);
      // Chuyển hướng sau 3 giây
      setTimeout(() => navigate("/auth/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Link hết hạn hoặc không hợp lệ.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Đặt lại mật khẩu</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none" }}>
          Xác nhận
        </button>
      </form>

      {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;