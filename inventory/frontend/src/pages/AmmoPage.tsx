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
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Ammunition Inventory
      </h2>

      {ammo.length === 0 ? (
        <p style={{ textAlign: "center" }}>No ammunition available.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {ammo.map((a) => (
            <li
              key={a.id}
              style={{
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#fff",
              }}>
              <strong>{a.caliber}</strong> — {a.quantity} rounds
              <br />
              <small>
                Added on {new Date(a.createdAt).toLocaleDateString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
