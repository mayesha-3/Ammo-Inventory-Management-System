import { useEffect, useState } from "react";
import { getAmmoInventory } from "../services/api";

export default function AmmoPage() {
  const [ammo, setAmmo] = useState<any[]>([]);

  useEffect(() => {
    getAmmoInventory()
      .then((res) => setAmmo(res.data.ammo))
      .catch(() => alert("Failed to load ammo inventory"));
  }, []);

  return (
    <div
      style={{
        backgroundImage: "url('/wp2706117.jpg') !important",
        backgroundAttachment: "scroll",
        backgroundSize: "auto",
        backgroundRepeat: "repeat",
        minHeight: "100vh",
        padding: "0px, 0px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "40px",
          border: "3px solid white",
          borderRadius: "8px",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#d4af37",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}>
          Ammunition Inventory
        </h2>

        {ammo.length === 0 ? (
          <p style={{ textAlign: "center", color: "#7cb342" }}>
            No ammunition available.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {ammo.map((a) => (
              <li
                key={a.id}
                style={{
                  padding: "12px",
                  marginBottom: "10px",
                  border: "2px solid white",
                  borderRadius: "4px",
                  backgroundColor: "rgba(30, 30, 30, 0.9)",
                  color: "#d4af37",
                }}>
                <strong>{a.caliber}</strong> — {a.quantity} rounds
                <br />
                <small style={{ color: "#7cb342" }}>
                  Added on {new Date(a.createdAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
