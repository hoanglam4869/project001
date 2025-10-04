import { useState } from "react";
import Header from "../../components/header";

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

      // ✅ Lưu token và role
      localStorage.setItem("token", data.token);

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);

      // ✅ Redirect theo role
      switch (payload.role) {
        case "customer":
          window.location.href = "/customer/branches";
          break;
        case "staff":
          window.location.href = "/staff/bookings";
          break;
        case "manager":
          window.location.href = "/manager/services";
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
      <Header />
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
          <button type="submit" style={{ width: "100%" }}>Login</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </>
  );
}

export default Login;
