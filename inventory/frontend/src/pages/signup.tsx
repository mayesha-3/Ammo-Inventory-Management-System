import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/api"; 

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pinNo, setPinNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setError("");
      setLoading(true);
      await signup({ email, password, name, pinNo });
      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
      }}>
      <h2 style={{ marginBottom: "20px" }}>Signup</h2>

      {error && (
        <div style={{ padding: "12px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", marginBottom: "16px", color: "#991b1b" }}>
          {error}
        </div>
      )}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password (min 6 characters)"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <input
        value={pinNo}
        onChange={(e) => setPinNo(e.target.value)}
        placeholder="PIN Number"
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#999" : "#217523ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}>
        {loading ? "Signing up..." : "Signup"}
      </button>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ marginBottom: "10px", color: "#666" }}>
          Already have an account?
        </p>
        <button
          onClick={() => navigate("/login")}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#999" : "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            width: "100%",
          }}>
          Login Here
        </button>
      </div>
    </div>
  );
}
