import { useEffect, useState } from "react";
import * as api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [issuances, setIssuances] = useState<any[]>([]);
  const [ammoInventory, setAmmoInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ammos, setAmmos] = useState<any[]>([]);
  const [caliber, setCaliber] = useState("");
  const [quantity, setQuantity] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [adminSubTab, setAdminSubTab] = useState("users");
  const [editingAmmoId, setEditingAmmoId] = useState<number | null>(null);
  const [editCaliber, setEditCaliber] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [newAmmoCaliber, setNewAmmoCaliber] = useState("");
  const [newAmmoQuantity, setNewAmmoQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const res = await api.getMe();
      setUser(res.data);
    } catch (err: any) {
      setError("Failed to load user data: " + err.message);
      console.error(err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch issuances with try-catch
      try {
        const issuancesRes = await api.getMyIssuances();
        setIssuances(issuancesRes.data?.issuances || []);
      } catch (err) {
        console.error("Failed to load issuances:", err);
        setIssuances([]);
      }

      // Fetch inventory with try-catch
      try {
        const inventoryRes = await api.getAmmoInventory();
        setAmmoInventory(inventoryRes.data?.ammo || []);
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setAmmoInventory([]);
      }

      // Fetch users for admin/moderator with try-catch
      if (user?.role === "admin" || user?.role === "moderator") {
        try {
          const usersRes = await api.getAllUsers();
          setUsers(usersRes.data?.users || []);
        } catch (err) {
          console.error("Failed to load users:", err);
          setUsers([]);
        }

        // Fetch all orders for admin
        try {
          const ordersRes = await api.getAllOrders();
          setOrders(ordersRes.data?.orders || []);
        } catch (err) {
          console.error("Failed to load orders:", err);
          setOrders([]);
        }

        // Fetch all ammos for admin
        try {
          const ammosRes = await api.getAmmoForAdmin();
          setAmmos(ammosRes.data?.ammo || []);
        } catch (err) {
          console.error("Failed to load ammos:", err);
          setAmmos([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAmmo = async () => {
    if (!caliber || !quantity || Number(quantity) <= 0) {
      setError("Please enter valid caliber and quantity");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.orderAmmo({ caliber, quantity: Number(quantity) });
      alert("Ammunition order placed successfully!");
      setCaliber("");
      setQuantity("");
      await fetchDashboardData();
    } catch (err: any) {
      setError("Failed to place order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: number, status: string) => {
    try {
      setLoading(true);
      await api.updateOrderStatus(orderId, status);
      alert(`Order ${status} successfully!`);
      await fetchDashboardData();
    } catch (err: any) {
      setError("Failed to update order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmmo = async () => {
    if (!newAmmoCaliber || !newAmmoQuantity) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await api.createAmmo({ caliber: newAmmoCaliber, quantity: Number(newAmmoQuantity) });
      alert("Ammunition added successfully!");
      setNewAmmoCaliber("");
      setNewAmmoQuantity("");
      await fetchDashboardData();
    } catch (err: any) {
      setError("Failed to add ammo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAmmo = async (id: number) => {
    if (!editCaliber || !editQuantity) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await api.updateAmmo(id, { caliber: editCaliber, quantity: Number(editQuantity) });
      alert("Ammunition updated successfully!");
      setEditingAmmoId(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError("Failed to update ammo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAmmo = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this ammo?")) return;
    try {
      setLoading(true);
      setError("");
      await api.deleteAmmo(id);
      alert("Ammunition deleted successfully!");
      await fetchDashboardData();
    } catch (err: any) {
      setError("Failed to delete ammo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditingAmmo = (ammo: any) => {
    setEditingAmmoId(ammo.id);
    setEditCaliber(ammo.caliber);
    setEditQuantity(ammo.quantity);
  };

  const cancelEditingAmmo = () => {
    setEditingAmmoId(null);
    setEditCaliber("");
    setEditQuantity("");
  };

  const calculateTotalRounds = (items: any[] | any) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      approved: "#22c55e",
      pending: "#eab308",
      rejected: "#ef4444",
      completed: "#3b82f6",
    };
    return colors[status?.toLowerCase()] || "#6b7280";
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
          <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading user data...</p>
          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              color: "#991b1b"
            }}>
              {error}
              <br />
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  marginTop: "8px",
                  padding: "8px 16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", background: "white", padding: "20px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
            Ammunition Management System
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "12px" }}>
            <div style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: "6px" }}>
              <strong>Name:</strong> {user?.name || "N/A"}
            </div>
            <div style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: "6px" }}>
              <strong>Email:</strong> {user?.email || "N/A"}
            </div>
            <div style={{ padding: "8px 16px", background: "#dbeafe", borderRadius: "6px", color: "#1e40af" }}>
              <strong>Role:</strong> {user?.role?.toUpperCase() || "USER"}
            </div>
            {user?.pinNo && (
              <div style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: "6px" }}>
                <strong>PIN:</strong> {user.pinNo}
              </div>
            )}
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}>
          Logout
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", marginBottom: "16px", color: "#991b1b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{error}</span>
          <button onClick={() => setError("")} style={{ marginLeft: "12px", padding: "4px 8px", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "white", padding: "0 20px", borderRadius: "8px 8px 0 0", overflowX: "auto" }}>
        {["overview", "order", "history", "inventory"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              background: activeTab === tab ? "#3b82f6" : "transparent",
              color: activeTab === tab ? "white" : "#6b7280",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              textTransform: "capitalize"
            }}>
            {tab}
          </button>
        ))}
        {(user?.role === "admin" || user?.role === "moderator") && (
          <button onClick={() => setActiveTab("admin")} style={{ padding: "12px 24px", background: activeTab === "admin" ? "#3b82f6" : "transparent", color: activeTab === "admin" ? "white" : "#6b7280", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
            Admin
          </button>
        )}
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "0 0 8px 8px", minHeight: "500px" }}>
        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Dashboard Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "24px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Total Issued</div>
                <div style={{ fontSize: "36px", fontWeight: "700" }}>{calculateTotalRounds(issuances)}</div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>rounds</div>
              </div>
              <div style={{ padding: "24px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Issuance Count</div>
                <div style={{ fontSize: "36px", fontWeight: "700" }}>{issuances.length}</div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>transactions</div>
              </div>
              <div style={{ padding: "24px", background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Inventory Stock</div>
                <div style={{ fontSize: "36px", fontWeight: "700" }}>{calculateTotalRounds(ammoInventory)}</div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>rounds available</div>
              </div>
              <div style={{ padding: "24px", background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", borderRadius: "12px", color: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Caliber Types</div>
                <div style={{ fontSize: "36px", fontWeight: "700" }}>{ammoInventory.length}</div>
                <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>different calibers</div>
              </div>
            </div>

            <div style={{ marginTop: "32px", padding: "20px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "#92400e" }}>Quick Actions</h3>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={() => setActiveTab("order")} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>Order Ammunition</button>
                <button onClick={() => setActiveTab("inventory")} style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>View Inventory</button>
                <button onClick={fetchDashboardData} disabled={loading} style={{ padding: "10px 20px", background: loading ? "#9ca3af" : "#6b7280", color: "white", border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "500" }}>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order */}
        {activeTab === "order" && (
          <div style={{ maxWidth: "600px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Order Ammunition</h2>
            <div style={{ padding: "24px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>Caliber</label>
                <input value={caliber} onChange={(e) => setCaliber(e.target.value)} placeholder="e.g., 9mm, 5.56mm" style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>Quantity</label>
                <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Number of rounds" type="number" min="1" style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <button onClick={handleOrderAmmo} disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? "#9ca3af" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "16px" }}>
                {loading ? "Processing..." : "Submit Order"}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Issuance History</h2>
            {issuances.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>ID</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Date</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Caliber</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Quantity</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issuances.map((i) => (
                    <tr key={i.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px" }}>#{i.id}</td>
                      <td style={{ padding: "12px" }}>{i.issuedAt ? new Date(i.issuedAt).toLocaleDateString() : "N/A"}</td>
                      <td style={{ padding: "12px", fontWeight: "500" }}>{i.caliber || "N/A"}</td>
                      <td style={{ padding: "12px" }}>{i.quantity} rounds</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 12px", background: getStatusColor(i.status || "approved") + "20", color: getStatusColor(i.status || "approved"), borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}>
                          {i.status || "approved"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>No records found</p>
            )}
          </div>
        )}

        {/* Inventory */}
        {activeTab === "inventory" && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Ammunition Inventory</h2>
            {ammoInventory.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>ID</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Caliber</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Quantity</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ammoInventory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px" }}>#{item.id}</td>
                      <td style={{ padding: "12px", fontWeight: "500" }}>{item.caliber}</td>
                      <td style={{ padding: "12px" }}>{item.quantity} rounds</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 12px", background: item.quantity > 1000 ? "#d1fae5" : "#fee2e2", color: item.quantity > 1000 ? "#065f46" : "#991b1b", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}>
                          {item.quantity > 1000 ? "In Stock" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>No inventory found</p>
            )}
          </div>
        )}

        {/* Admin */}
        {activeTab === "admin" && (user?.role === "admin" || user?.role === "moderator") && (
          <div>
            {/* Admin Sub-tabs */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "2px solid #e5e7eb", paddingBottom: "12px" }}>
              <button onClick={() => setAdminSubTab("users")} style={{ padding: "8px 16px", background: adminSubTab === "users" ? "#3b82f6" : "transparent", color: adminSubTab === "users" ? "white" : "#6b7280", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                Users
              </button>
              <button onClick={() => setAdminSubTab("orders")} style={{ padding: "8px 16px", background: adminSubTab === "orders" ? "#3b82f6" : "transparent", color: adminSubTab === "orders" ? "white" : "#6b7280", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                Orders
              </button>
              <button onClick={() => setAdminSubTab("ammo")} style={{ padding: "8px 16px", background: adminSubTab === "ammo" ? "#3b82f6" : "transparent", color: adminSubTab === "ammo" ? "white" : "#6b7280", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                Ammo
              </button>
            </div>

            {/* Users Sub-tab */}
            {adminSubTab === "users" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>User Management</h2>
                {users.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>ID</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Name</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Email</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>PIN</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "12px" }}>#{u.id}</td>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{u.name}</td>
                          <td style={{ padding: "12px" }}>{u.email}</td>
                          <td style={{ padding: "12px" }}>{u.pinNo || "N/A"}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ padding: "4px 12px", background: "#dbeafe", color: "#1e40af", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}>{u.role}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>No users found</p>
                )}
              </div>
            )}

            {/* Orders Sub-tab */}
            {adminSubTab === "orders" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Orders Management</h2>
                {orders.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>ID</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>User ID</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Caliber</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Quantity</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "12px" }}>#{o.id}</td>
                          <td style={{ padding: "12px" }}>#{o.userId}</td>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{o.caliber}</td>
                          <td style={{ padding: "12px" }}>{o.quantity} rounds</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ padding: "4px 12px", background: getStatusColor(o.status) + "20", color: getStatusColor(o.status), borderRadius: "12px", fontSize: "12px", fontWeight: "500", textTransform: "capitalize" }}>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              {o.status === "pending" && (
                                <>
                                  <button onClick={() => handleApproveOrder(o.id, "approved")} disabled={loading} style={{ padding: "6px 12px", background: loading ? "#9ca3af" : "#22c55e", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "500" }}>
                                    Approve
                                  </button>
                                  <button onClick={() => handleApproveOrder(o.id, "rejected")} disabled={loading} style={{ padding: "6px 12px", background: loading ? "#9ca3af" : "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "500" }}>
                                    Reject
                                  </button>
                                </>
                              )}
                              {o.status === "approved" && (
                                <button onClick={() => handleApproveOrder(o.id, "completed")} disabled={loading} style={{ padding: "6px 12px", background: loading ? "#9ca3af" : "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "500" }}>
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>No orders found</p>
                )}
              </div>
            )}

            {/* Ammo Sub-tab */}
            {adminSubTab === "ammo" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Ammo Inventory Management</h2>

                {/* Add New Ammo Form */}
                <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "8px", marginBottom: "24px", border: "1px solid #e5e7eb" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Add New Ammunition</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Caliber</label>
                      <input
                        type="text"
                        placeholder="e.g., 9mm, .45 ACP"
                        value={newAmmoCaliber}
                        onChange={(e) => setNewAmmoCaliber(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px", color: "#374151" }}>Quantity (rounds)</label>
                      <input
                        type="number"
                        placeholder="Enter quantity"
                        value={newAmmoQuantity}
                        onChange={(e) => setNewAmmoQuantity(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      />
                    </div>
                    <button
                      onClick={handleAddAmmo}
                      disabled={loading}
                      style={{ padding: "8px 20px", background: loading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: loading ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "14px" }}
                    >
                      {loading ? "Adding..." : "Add Ammo"}
                    </button>
                  </div>
                </div>

                {/* Ammo List Table */}
                {ammos && ammos.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>ID</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Caliber</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Quantity</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Created</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ammos.map((ammo: any) => (
                        <tr key={ammo.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          {editingAmmoId === ammo.id ? (
                            <>
                              <td style={{ padding: "12px" }}>#{ammo.id}</td>
                              <td style={{ padding: "12px" }}>
                                <input
                                  type="text"
                                  value={editCaliber}
                                  onChange={(e) => setEditCaliber(e.target.value)}
                                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "14px" }}
                                />
                              </td>
                              <td style={{ padding: "12px" }}>
                                <input
                                  type="number"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "14px" }}
                                />
                              </td>
                              <td style={{ padding: "12px", color: "#6b7280", fontSize: "14px" }}>
                                {ammo.createdAt ? new Date(ammo.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => handleUpdateAmmo(ammo.id)}
                                    disabled={loading}
                                    style={{ padding: "6px 12px", background: loading ? "#9ca3af" : "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "500" }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditingAmmo}
                                    disabled={loading}
                                    style={{ padding: "6px 12px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding: "12px" }}>#{ammo.id}</td>
                              <td style={{ padding: "12px", fontWeight: "500" }}>{ammo.caliber}</td>
                              <td style={{ padding: "12px" }}>{ammo.quantity.toLocaleString()} rounds</td>
                              <td style={{ padding: "12px", color: "#6b7280", fontSize: "14px" }}>
                                {ammo.createdAt ? new Date(ammo.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => startEditingAmmo(ammo)}
                                    disabled={loading}
                                    style={{ padding: "6px 12px", background: loading ? "#9ca3af" : "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "500" }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAmmo(ammo.id)}
                                    disabled={loading}
                                    style={{ padding: "6px 12px", background: loading ? "#9ca3af" : "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "500" }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#f9fafb", borderRadius: "8px" }}>No ammo inventory found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}