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
        backgroundImage: "url('/wp2706117.jpg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0px",
      }}>
      <div
        style={{
          maxWidth: "400px",
          padding: "40px",
          border: "3px solid white",
          borderRadius: "8px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          textAlign: "center",
        }}>
        <h2
          style={{
            marginBottom: "10px",
            color: "#d4af37",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}>
          Create Account
        </h2>
        <p
          style={{
            marginBottom: "20px",
            color: "#7cb342",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}>
          Sign up to get started
        </p>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#dc2626",
              border: "2px solid white",
              borderRadius: "6px",
              marginBottom: "16px",
              color: "white",
              fontWeight: "600",
            }}>
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
            border: "2px solid white",
            boxSizing: "border-box",
            backgroundColor: "#1a1a1a",
            color: "white",
            fontSize: "14px",
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
            border: "2px solid white",
            boxSizing: "border-box",
            backgroundColor: "#1a1a1a",
            color: "white",
            fontSize: "14px",
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
            border: "2px solid white",
            boxSizing: "border-box",
            backgroundColor: "#1a1a1a",
            color: "white",
            fontSize: "14px",
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
            border: "2px solid white",
            boxSizing: "border-box",
            backgroundColor: "#1a1a1a",
            color: "white",
            fontSize: "14px",
          }}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#556b2f" : "#7cb342",
            color: "white",
            border: "2px solid white",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            marginBottom: "15px",
          }}>
          {loading ? "Signing up..." : "Signup"}
        </button>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p
            style={{
              marginBottom: "10px",
              color: "#d4af37",
              fontSize: "14px",
            }}>
            Already have an account?
          </p>
          <button
            onClick={() => navigate("/login")}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 20px",
              backgroundColor: loading ? "#556b2f" : "#4a5f1f",
              color: "white",
              border: "2px solid white",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}>
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
}
