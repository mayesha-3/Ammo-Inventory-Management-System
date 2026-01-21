import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed - Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2> Ammo Inventory Management </h2>
      <hr />

      <div
        style={{
          backgroundColor: "#f4f4f4",
          padding: "20px",
          borderWidth: "8px",
          borderColor: "#501212ff",
          textAlign: "center",
        }}>
        <h2>Login</h2>
        
        {error && (
          <div style={{ padding: "12px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", marginBottom: "16px", color: "#991b1b" }}>
            {error}
          </div>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={loading}
          style={{ marginBottom: "10px", padding: "8px", width: "100%", boxSizing: "border-box" }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          disabled={loading}
          style={{ marginBottom: "10px", padding: "8px", width: "100%", boxSizing: "border-box" }}
        />
        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: "10px 20px",
            width: "100%",
            backgroundColor: loading ? "#999" : "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold"
          }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ marginTop: "20px" }}>
          <p style={{ marginBottom: "10px", color: "#666" }}>
            Don't have an account?
          </p>
          <button
            onClick={() => navigate("/signup")}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: loading ? "#999" : "#217523ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              width: "100%",
            }}>
            Sign Up Here
          </button>
        </div>
      </div>
    </div>
  );
}
