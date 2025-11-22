import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/api"; // Import axios instance của bạn

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/api/auth/forgot-password", { email });
      setMessage(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Quên mật khẩu</h2>
      <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none" }}>
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </form>

      {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <Link to="/auth/login">Quay lại Đăng nhập</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;