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
    <div style={{ backgroundImage: "url('/wp2706117.jpg')", backgroundAttachment: "fixed", backgroundSize: "cover", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0px, 0px" }}>
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "40px",
          borderRadius: "8px",
          border: "3px solid white",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%"
        }}>
        <h2 style={{ color: "#d4af37", marginBottom: "10px", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>Ammo Inventory</h2>
        <h3 style={{ color: "#7cb342", marginTop: "0", marginBottom: "30px", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>Management System</h3>
        
        {error && (
          <div style={{ padding: "12px", background: "#dc2626", border: "2px solid white", borderRadius: "6px", marginBottom: "16px", color: "white", fontWeight: "600" }}>
            {error}
          </div>
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={loading}
          style={{ marginBottom: "10px", padding: "10px", width: "100%", boxSizing: "border-box", border: "2px solid white", borderRadius: "4px", backgroundColor: "#1a1a1a", color: "white", fontSize: "14px" }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          disabled={loading}
          style={{ marginBottom: "20px", padding: "10px", width: "100%", boxSizing: "border-box", border: "2px solid white", borderRadius: "4px", backgroundColor: "#1a1a1a", color: "white", fontSize: "14px" }}
        />
        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: "12px 20px",
            width: "100%",
            backgroundColor: loading ? "#556b2f" : "#4a5f1f",
            color: "white",
            border: "2px solid white",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ marginTop: "30px" }}>
          <p style={{ marginBottom: "10px", color: "#d4af37", fontSize: "14px" }}>
            Don't have an account?
          </p>
          <button
            onClick={() => navigate("/signup")}
            disabled={loading}
            style={{
              padding: "12px 20px",
              backgroundColor: loading ? "#556b2f" : "#7cb342",
              color: "white",
              border: "2px solid white",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              width: "100%",
              fontSize: "16px"
            }}>
            Sign Up Here
          </button>
        </div>
      </div>
    </div>
  );
}
