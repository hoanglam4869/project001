import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link nếu bạn có dùng

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Login failed");
        return;
      }

      // ✅ Lưu token
      localStorage.setItem("token", data.token);

      // ✅ Giải mã payload JWT
      const payload = JSON.parse(atob(data.token.split(".")[1]));

      // ✅ LƯU NAME, ROLE, USER ID VÀO LOCALSTORAGE
      localStorage.setItem("role", payload.role);
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: payload.user_id, 
          name: payload.name, // ✅ Đã thêm thuộc tính 'name'
          email: payload.email, // LƯU Ý: email không có trong JWT payload ở authController.js của bạn, nhưng nếu có thì tốt
          role: payload.role,
          hotel_id: payload.hotel_id,
        })
      );

      // ✅ Điều hướng theo vai trò
      switch (payload.role) {
        case "customer":
          window.location.href = "/customer/branches";
          break;
        case "staff":
          window.location.href = "/staff/bookings";
          break;
        case "manager":
          window.location.href = "/manager/room-types";
          break;
        case "admin":
          window.location.href = "/admin/accounts";
          break;
        default:
          window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <>
      <div style={{ maxWidth: "400px", margin: "50px auto" }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <button type="submit" style={{ width: "100%" }}>
            Login
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* Thêm link Register nếu cần */}
        <p style={{marginTop: '15px', textAlign: 'center'}}>
           Chưa có tài khoản? <Link to="/auth/register">Đăng ký ngay</Link>
        </p>
      </div>
    </>
  );
}

export default Login;