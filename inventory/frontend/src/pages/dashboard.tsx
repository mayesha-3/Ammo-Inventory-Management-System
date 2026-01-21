import { useEffect, useState } from "react";
import * as api from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [issuances, setIssuances] = useState<any[]>([]);
  const [ammoInventory, setAmmoInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
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
  const [approvingOrder, setApprovingOrder] = useState<any>(null);
  const [approvalQuantity, setApprovalQuantity] = useState<number>(0);
  const [selectedAmmoForApproval, setSelectedAmmoForApproval] = useState<number | null>(null);

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

      // Fetch user's own orders with try-catch
      try {
        const myOrdersRes = await api.getMyOrders();
        setMyOrders(myOrdersRes.data?.orders || []);
      } catch (err) {
        console.error("Failed to load my orders:", err);
        setMyOrders([]);
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

  const handleApproveOrder = async (orderId: number, status: string) => {
    // For approval status, we need quantity and ammoId, so open modal
    if (status === "approved") {
      const order = orders.find(o => o.id === orderId);
      setApprovingOrder(order);
      setApprovalQuantity(order.quantity);
      setSelectedAmmoForApproval(null);
      return;
    }

    // For reject/complete, just update directly
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

  const handleConfirmApproval = async () => {
    if (!selectedAmmoForApproval || !approvalQuantity) {
      setError("Please select an ammo item and quantity");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.updateOrderStatus(
        approvingOrder.id,
        "approved",
        approvalQuantity,
        selectedAmmoForApproval
      );
      alert(`Order approved! Stock reduced by ${approvalQuantity} rounds`);
      setApprovingOrder(null);
      setApprovalQuantity(0);
      setSelectedAmmoForApproval(null);
      await fetchDashboardData();
    } catch (err: any) {
      setError("Failed to approve order: " + err.message);
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

  const getStatusColor = (status: string) => {
    const colors: any = {
      approved: "#22c55e",
      pending: "#eab308",
      rejected: "#dc2626",
      completed: "#7cb342",
    };
    return colors[status?.toLowerCase()] || "#d4af37";
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div
      
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0px, 0px",
    backgroundImage: "url('/wp2706117.jpg')",
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
  }}
>
  <div
    style={{
      textAlign: "center",
      background: "rgba(0, 0, 0, 0.85)",
      padding: "40px",
      borderRadius: "8px",
      border: "3px solid white",
    }}
  >
    <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚙️</div>
    <p style={{ fontSize: "18px", color: "#d4af37", marginBottom: "16px" }}>
      Loading user data...
    </p>
    {error && (
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "rgba(220, 38, 38, 0.2)",
          border: "2px solid #dc2626",
          borderRadius: "6px",
          color: "#fca5a5",
        }}
      >
        {error}
        <br />
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            marginTop: "8px",
            padding: "8px 16px",
            background: "#dc2626",
            color: "white",
            border: "2px solid white",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "600",
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
    <div
      style={{
        backgroundImage: "url('/wp2706117.jpg')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "32px",
            background: "rgba(0, 0, 0, 0.85)",
            padding: "20px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            flexWrap: "wrap",
            gap: "16px",
            border: "3px solid white",
          }}>
          <div style={{ flex: "1 1 300px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#d4af37",
                margin: "0 0 8px 0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}>
              Ammunition Management
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#7cb342",
                margin: "0 0 12px 0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}>
              Military Grade Inventory System
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginTop: "12px",
              }}>
              <div
                style={{
                  padding: "8px 16px",
                  background: "rgba(124, 179, 66, 0.2)",
                  borderRadius: "6px",
                  border: "2px solid #7cb342",
                  color: "#d4af37",
                  fontSize: "13px",
                }}>
                <strong>Name:</strong> {user?.name || "N/A"}
              </div>
              <div
                style={{
                  padding: "8px 16px",
                  background: "rgba(124, 179, 66, 0.2)",
                  borderRadius: "6px",
                  border: "2px solid #7cb342",
                  color: "#d4af37",
                  fontSize: "13px",
                }}>
                <strong>Role:</strong> {user?.role?.toUpperCase() || "USER"}
              </div>
              {user?.pinNo && (
                <div
                  style={{
                    padding: "8px 16px",
                    background: "rgba(124, 179, 66, 0.2)",
                    borderRadius: "6px",
                    border: "2px solid #7cb342",
                    color: "#d4af37",
                    fontSize: "13px",
                  }}>
                  <strong>PIN:</strong> {user.pinNo}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              background: "#dc2626",
              color: "white",
              border: "2px solid white",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
            }}>
            Logout
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#dc2626",
              border: "2px solid white",
              borderRadius: "6px",
              marginBottom: "16px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "600",
            }}>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "12px",
                padding: "4px 8px",
                background: "white",
                color: "#dc2626",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}>
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            background: "rgba(0, 0, 0, 0.85)",
            padding: "0 20px",
            borderRadius: "8px 8px 0 0",
            overflowX: "auto",
            border: "3px solid white",
            borderBottom: "none",
          }}>
          {["overview", "order", "history", "inventory"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px",
                background: activeTab === tab ? "#7cb342" : "transparent",
                color: activeTab === tab ? "white" : "#d4af37",
                border: activeTab === tab ? "2px solid white" : "none",
                cursor: "pointer",
                fontWeight: activeTab === tab ? "700" : "500",
                fontSize: "14px",
                textTransform: "capitalize",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}>
              {tab}
            </button>
          ))}
          {(user?.role === "admin" || user?.role === "moderator") && (
            <button
              onClick={() => setActiveTab("admin")}
              style={{
                padding: "12px 24px",
                background: activeTab === "admin" ? "#7cb342" : "transparent",
                color: activeTab === "admin" ? "white" : "#d4af37",
                border: activeTab === "admin" ? "2px solid white" : "none",
                cursor: "pointer",
                fontWeight: activeTab === "admin" ? "700" : "500",
                fontSize: "14px",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}>
              Admin
            </button>
          )}
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            padding: "24px",
            borderRadius: "0 0 8px 8px",
            minHeight: "500px",
            border: "3px solid white",
            borderTop: "none",
            color: "white",
          }}>
          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "24px",
                  color: "#d4af37",
                }}>
                Dashboard Overview
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                }}>
                <div
                  style={{
                    padding: "24px",
                    background: "rgba(124, 179, 66, 0.2)",
                    border: "2px solid #7cb342",
                    borderRadius: "12px",
                    color: "#d4af37",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  }}>
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                      marginBottom: "8px",
                    }}>
                    Total Issued
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "700" }}>
                    {calculateTotalRounds(issuances) +
                      calculateTotalRounds(
                        myOrders.filter((o) => o.status === "completed"),
                      )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.8,
                      marginTop: "4px",
                    }}>
                    rounds
                  </div>
                </div>
                <div
                  style={{
                    padding: "24px",
                    background: "rgba(124, 179, 66, 0.2)",
                    border: "2px solid #7cb342",
                    borderRadius: "12px",
                    color: "#d4af37",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  }}>
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                      marginBottom: "8px",
                    }}>
                    Issuance Count
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "700" }}>
                    {issuances.length}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.8,
                      marginTop: "4px",
                    }}>
                    transactions
                  </div>
                </div>
                <div
                  style={{
                    padding: "24px",
                    background: "rgba(124, 179, 66, 0.2)",
                    border: "2px solid #7cb342",
                    borderRadius: "12px",
                    color: "#d4af37",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  }}>
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                      marginBottom: "8px",
                    }}>
                    Inventory Stock
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "700" }}>
                    {calculateTotalRounds(ammoInventory)}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.8,
                      marginTop: "4px",
                    }}>
                    rounds available
                  </div>
                </div>
                <div
                  style={{
                    padding: "24px",
                    background: "rgba(124, 179, 66, 0.2)",
                    border: "2px solid #7cb342",
                    borderRadius: "12px",
                    color: "#d4af37",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                  }}>
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                      marginBottom: "8px",
                    }}>
                    Caliber Types
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: "700" }}>
                    {ammoInventory.length}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.8,
                      marginTop: "4px",
                    }}>
                    different calibers
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "32px",
                  padding: "20px",
                  background: "rgba(124, 179, 66, 0.1)",
                  border: "2px solid #7cb342",
                  borderRadius: "8px",
                }}>
                <h3 style={{ margin: "0 0 12px 0", color: "#d4af37" }}>
                  Quick Actions
                </h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setActiveTab("order")}
                    style={{
                      padding: "10px 20px",
                      background: "#7cb342",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}>
                    Order Ammunition
                  </button>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    style={{
                      padding: "10px 20px",
                      background: "#7cb342",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}>
                    View Inventory
                  </button>
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      background: loading ? "#556b2f" : "#4a5f1f",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "500",
                    }}>
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order */}
          {activeTab === "order" && (
            <div>
              <div style={{ maxWidth: "600px", marginBottom: "40px" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    marginBottom: "24px",
                    color: "#d4af37",
                  }}>
                  Place Order
                </h2>
                <div
                  style={{
                    padding: "24px",
                    background: "rgba(124, 179, 66, 0.1)",
                    border: "2px solid #7cb342",
                    borderRadius: "8px",
                  }}>
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#d4af37",
                      }}>
                      Caliber
                    </label>
                    <input
                      value={caliber}
                      onChange={(e) => setCaliber(e.target.value)}
                      placeholder="e.g., 9mm, 5.56mm"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "2px solid #7cb342",
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        backgroundColor: "#1a1a1a",
                        color: "#d4af37",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#d4af37",
                      }}>
                      Quantity
                    </label>
                    <input
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Number of rounds"
                      type="number"
                      min="1"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "2px solid #7cb342",
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                        backgroundColor: "#1a1a1a",
                        color: "#d4af37",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleOrderAmmo}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: loading ? "#556b2f" : "#7cb342",
                      color: "white",
                      border: "2px solid white",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "16px",
                    }}>
                    {loading ? "Processing..." : "Submit Order"}
                  </button>
                </div>
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "24px",
                  color: "#d4af37",
                }}>
                Order History
              </h2>
              {myOrders.length > 0 ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "2px solid #7cb342",
                  }}>
                  <thead>
                    <tr
                      style={{
                        background: "rgba(124, 179, 66, 0.2)",
                        borderBottom: "2px solid #7cb342",
                      }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        ID
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Caliber
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Quantity
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map((order) => (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: "1px solid #7cb342",
                          background: "rgba(0, 0, 0, 0.2)",
                        }}>
                        <td style={{ padding: "12px", color: "#d4af37" }}>
                          #{order.id}
                        </td>
                        <td style={{ padding: "12px", color: "#d4af37" }}>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: "500",
                            color: "#d4af37",
                          }}>
                          {order.caliber || "N/A"}
                        </td>
                        <td style={{ padding: "12px", color: "#d4af37" }}>
                          {order.quantity} rounds
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              background:
                                getStatusColor(order.status || "pending") +
                                "30",
                              color: getStatusColor(order.status || "pending"),
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              border: `1px solid ${getStatusColor(order.status || "pending")}`,
                            }}>
                            {order.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#7cb342",
                    background: "rgba(124, 179, 66, 0.1)",
                    borderRadius: "8px",
                    border: "2px solid #7cb342",
                  }}>
                  No orders yet
                </p>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "24px",
                  color: "#d4af37",
                }}>
                Issuance History
              </h2>
              {(() => {
                const completedOrders = myOrders.filter(
                  (o) => o.status === "completed",
                );
                const allHistory = [
                  ...issuances.map((i) => ({
                    ...i,
                    type: "issuance",
                    date: i.issuedAt,
                  })),
                  ...completedOrders.map((o) => ({
                    ...o,
                    type: "order",
                    date: o.createdAt,
                  })),
                ].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                );

                return allHistory.length > 0 ? (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      border: "2px solid #7cb342",
                    }}>
                    <thead>
                      <tr
                        style={{
                          background: "rgba(124, 179, 66, 0.2)",
                          borderBottom: "2px solid #7cb342",
                        }}>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                            color: "#d4af37",
                          }}>
                          ID
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                            color: "#d4af37",
                          }}>
                          Date
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                            color: "#d4af37",
                          }}>
                          Caliber
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                            color: "#d4af37",
                          }}>
                          Quantity
                        </th>
                        <th
                          style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                            color: "#d4af37",
                          }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allHistory.map((item) => (
                        <tr
                          key={`${item.type}-${item.id}`}
                          style={{
                            borderBottom: "1px solid #7cb342",
                            background: "rgba(0, 0, 0, 0.2)",
                          }}>
                          <td style={{ padding: "12px", color: "#d4af37" }}>
                            #{item.id}
                          </td>
                          <td style={{ padding: "12px", color: "#d4af37" }}>
                            {item.date
                              ? new Date(item.date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontWeight: "500",
                              color: "#d4af37",
                            }}>
                            {item.caliber || "N/A"}
                          </td>
                          <td style={{ padding: "12px", color: "#d4af37" }}>
                            {item.quantity} rounds
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                padding: "4px 12px",
                                background:
                                  getStatusColor(item.status || "completed") +
                                  "30",
                                color: getStatusColor(
                                  item.status || "completed",
                                ),
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "500",
                                border: `1px solid ${getStatusColor(item.status || "completed")}`,
                              }}>
                              {item.status || "completed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#7cb342",
                      background: "rgba(124, 179, 66, 0.1)",
                      borderRadius: "8px",
                      border: "2px solid #7cb342",
                    }}>
                    No records found
                  </p>
                );
              })()}
            </div>
          )}

          {/* Inventory */}
          {activeTab === "inventory" && (
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "24px",
                  color: "#d4af37",
                }}>
                Ammunition Inventory
              </h2>
              {ammoInventory.length > 0 ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "2px solid #7cb342",
                  }}>
                  <thead>
                    <tr
                      style={{
                        background: "rgba(124, 179, 66, 0.2)",
                        borderBottom: "2px solid #7cb342",
                      }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        ID
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Caliber
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Quantity
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#d4af37",
                        }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ammoInventory.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px solid #7cb342",
                          background: "rgba(0, 0, 0, 0.2)",
                        }}>
                        <td style={{ padding: "12px", color: "#d4af37" }}>
                          #{item.id}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: "500",
                            color: "#d4af37",
                          }}>
                          {item.caliber}
                        </td>
                        <td style={{ padding: "12px", color: "#d4af37" }}>
                          {item.quantity} rounds
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              background:
                                item.quantity > 1000
                                  ? "#7cb34220"
                                  : "#dc262620",
                              color:
                                item.quantity > 1000 ? "#7cb342" : "#dc2626",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              border: `1px solid ${item.quantity > 1000 ? "#7cb342" : "#dc2626"}`,
                            }}>
                            {item.quantity > 1000 ? "In Stock" : "Low"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#7cb342",
                    background: "rgba(124, 179, 66, 0.1)",
                    borderRadius: "8px",
                    border: "2px solid #7cb342",
                  }}>
                  No inventory found
                </p>
              )}
            </div>
          )}

          {/* Admin */}
          {activeTab === "admin" &&
            (user?.role === "admin" || user?.role === "moderator") && (
              <div>
                {/* Admin Sub-tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "24px",
                    borderBottom: "2px solid #7cb342",
                    paddingBottom: "12px",
                  }}>
                  <button
                    onClick={() => setAdminSubTab("users")}
                    style={{
                      padding: "8px 16px",
                      background:
                        adminSubTab === "users" ? "#7cb342" : "transparent",
                      color: adminSubTab === "users" ? "white" : "#d4af37",
                      border:
                        adminSubTab === "users" ? "2px solid white" : "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}>
                    Users
                  </button>
                  <button
                    onClick={() => setAdminSubTab("orders")}
                    style={{
                      padding: "8px 16px",
                      background:
                        adminSubTab === "orders" ? "#7cb342" : "transparent",
                      color: adminSubTab === "orders" ? "white" : "#d4af37",
                      border:
                        adminSubTab === "orders" ? "2px solid white" : "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}>
                    Orders
                  </button>
                  <button
                    onClick={() => setAdminSubTab("ammo")}
                    style={{
                      padding: "8px 16px",
                      background:
                        adminSubTab === "ammo" ? "#7cb342" : "transparent",
                      color: adminSubTab === "ammo" ? "white" : "#d4af37",
                      border:
                        adminSubTab === "ammo" ? "2px solid white" : "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}>
                    Ammo
                  </button>
                </div>

                {/* Users Sub-tab */}
                {adminSubTab === "users" && (
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        marginBottom: "24px",
                        color: "#d4af37",
                      }}>
                      User Management
                    </h2>
                    {users.length > 0 ? (
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "2px solid #7cb342",
                        }}>
                        <thead>
                          <tr
                            style={{
                              background: "rgba(124, 179, 66, 0.2)",
                              borderBottom: "2px solid #7cb342",
                            }}>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              ID
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Name
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Email
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              PIN
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Role
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr
                              key={u.id}
                              style={{
                                borderBottom: "1px solid #7cb342",
                                background: "rgba(0, 0, 0, 0.2)",
                              }}>
                              <td style={{ padding: "12px", color: "#d4af37" }}>
                                #{u.id}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  fontWeight: "500",
                                  color: "#d4af37",
                                }}>
                                {u.name}
                              </td>
                              <td style={{ padding: "12px", color: "#d4af37" }}>
                                {u.email}
                              </td>
                              <td style={{ padding: "12px", color: "#d4af37" }}>
                                {u.pinNo || "N/A"}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    background: "#7cb34220",
                                    color: "#7cb342",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    border: "1px solid #7cb342",
                                  }}>
                                  {u.role}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#7cb342",
                          background: "rgba(124, 179, 66, 0.1)",
                          borderRadius: "8px",
                          border: "2px solid #7cb342",
                        }}>
                        No users found
                      </p>
                    )}
                  </div>
                )}

                {/* Orders Sub-tab */}
                {adminSubTab === "orders" && (
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        marginBottom: "24px",
                        color: "#d4af37",
                      }}>
                      Orders Management
                    </h2>
                    {orders.length > 0 ? (
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "2px solid #7cb342",
                        }}>
                        <thead>
                          <tr
                            style={{
                              background: "rgba(124, 179, 66, 0.2)",
                              borderBottom: "2px solid #7cb342",
                            }}>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              ID
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              User ID
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Caliber
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Quantity
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Status
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr
                              key={o.id}
                              style={{
                                borderBottom: "1px solid #7cb342",
                                background: "rgba(0, 0, 0, 0.2)",
                              }}>
                              <td style={{ padding: "12px", color: "#d4af37" }}>
                                #{o.id}
                              </td>
                              <td style={{ padding: "12px", color: "#d4af37" }}>
                                #{o.userId}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  fontWeight: "500",
                                  color: "#d4af37",
                                }}>
                                {o.caliber}
                              </td>
                              <td style={{ padding: "12px", color: "#d4af37" }}>
                                {o.quantity} rounds
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span
                                  style={{
                                    padding: "4px 12px",
                                    background: getStatusColor(o.status) + "30",
                                    color: getStatusColor(o.status),
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    textTransform: "capitalize",
                                    border: `1px solid ${getStatusColor(o.status)}`,
                                  }}>
                                  {o.status}
                                </span>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  {o.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleApproveOrder(o.id, "approved")
                                        }
                                        disabled={loading}
                                        style={{
                                          padding: "6px 12px",
                                          background: loading
                                            ? "#556b2f"
                                            : "#22c55e",
                                          color: "white",
                                          border: "2px solid white",
                                          borderRadius: "4px",
                                          cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                        }}>
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleApproveOrder(o.id, "rejected")
                                        }
                                        disabled={loading}
                                        style={{
                                          padding: "6px 12px",
                                          background: loading
                                            ? "#556b2f"
                                            : "#dc2626",
                                          color: "white",
                                          border: "2px solid white",
                                          borderRadius: "4px",
                                          cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                        }}>
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {o.status === "approved" && (
                                    <button
                                      onClick={() =>
                                        handleApproveOrder(o.id, "completed")
                                      }
                                      disabled={loading}
                                      style={{
                                        padding: "6px 12px",
                                        background: loading
                                          ? "#556b2f"
                                          : "#7cb342",
                                        color: "white",
                                        border: "2px solid white",
                                        borderRadius: "4px",
                                        cursor: loading
                                          ? "not-allowed"
                                          : "pointer",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                      }}>
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
                      <p
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#7cb342",
                          background: "rgba(124, 179, 66, 0.1)",
                          borderRadius: "8px",
                          border: "2px solid #7cb342",
                        }}>
                        No orders found
                      </p>
                    )}

                    {/* Approval Modal */}
                    {approvingOrder && (
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(0, 0, 0, 0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1000,
                          padding: "20px",
                        }}>
                        <div
                          style={{
                            background: "rgba(0, 0, 0, 0.9)",
                            borderRadius: "12px",
                            padding: "32px",
                            maxWidth: "600px",
                            width: "100%",
                            boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
                            border: "2px solid #7cb342",
                          }}>
                          <h2
                            style={{
                              fontSize: "24px",
                              fontWeight: "700",
                              color: "#d4af37",
                              margin: "0 0 16px 0",
                            }}>
                            Approve Order
                          </h2>

                          <div
                            style={{
                              background: "rgba(124, 179, 66, 0.1)",
                              padding: "16px",
                              borderRadius: "8px",
                              marginBottom: "20px",
                              borderLeft: "4px solid #7cb342",
                            }}>
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#7cb342",
                                marginBottom: "8px",
                              }}>
                              Order Details
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px",
                                fontSize: "14px",
                                color: "#d4af37",
                              }}>
                              <div>
                                <strong>Order ID:</strong> #{approvingOrder?.id}
                              </div>
                              <div>
                                <strong>User ID:</strong> #
                                {approvingOrder?.userId}
                              </div>
                              <div>
                                <strong>Caliber:</strong>{" "}
                                {approvingOrder?.caliber}
                              </div>
                              <div>
                                <strong>Requested:</strong>{" "}
                                {approvingOrder?.quantity} rounds
                              </div>
                            </div>
                          </div>

                          <div style={{ marginBottom: "20px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Select Ammunition to Issue
                            </label>
                            <select
                              value={selectedAmmoForApproval || ""}
                              onChange={(e) => {
                                const ammoId = parseInt(e.target.value);
                                setSelectedAmmoForApproval(ammoId);
                                const selected = ammoInventory.find(
                                  (a) => a.id === ammoId,
                                );
                                if (selected) {
                                  setApprovalQuantity(
                                    Math.min(
                                      approvingOrder.quantity,
                                      selected.quantity,
                                    ),
                                  );
                                }
                              }}
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: "2px solid #7cb342",
                                borderRadius: "8px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "#1a1a1a",
                                color: "#d4af37",
                              }}>
                              <option value="">-- Select an item --</option>
                              {ammoInventory
                                .filter(
                                  (a) => a.caliber === approvingOrder?.caliber,
                                )
                                .map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.caliber} (Available:{" "}
                                    {a.quantity.toLocaleString()} rounds)
                                  </option>
                                ))}
                            </select>
                            {ammoInventory.filter(
                              (a) => a.caliber === approvingOrder?.caliber,
                            ).length === 0 && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#dc2626",
                                  marginTop: "4px",
                                }}>
                                ⚠️ No inventory item matches the requested
                                caliber
                              </div>
                            )}
                          </div>

                          <div style={{ marginBottom: "20px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Quantity to Issue
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={approvingOrder?.quantity || 1}
                              value={approvalQuantity}
                              onChange={(e) =>
                                setApprovalQuantity(
                                  Math.max(1, parseInt(e.target.value) || 1),
                                )
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: "2px solid #7cb342",
                                borderRadius: "8px",
                                fontSize: "16px",
                                boxSizing: "border-box",
                                backgroundColor: "#1a1a1a",
                                color: "#d4af37",
                              }}
                            />
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#7cb342",
                                marginTop: "4px",
                              }}>
                              Maximum: {approvingOrder?.quantity} rounds
                              requested
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "12px" }}>
                            <button
                              onClick={() => {
                                setApprovingOrder(null);
                                setApprovalQuantity(0);
                                setSelectedAmmoForApproval(null);
                              }}
                              disabled={loading}
                              style={{
                                flex: 1,
                                padding: "12px",
                                background: "rgba(124, 179, 66, 0.2)",
                                color: "#d4af37",
                                border: "2px solid #7cb342",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                              }}>
                              Cancel
                            </button>
                            <button
                              onClick={handleConfirmApproval}
                              disabled={loading || !selectedAmmoForApproval}
                              style={{
                                flex: 1,
                                padding: "12px",
                                background:
                                  loading || !selectedAmmoForApproval
                                    ? "#556b2f"
                                    : "#7cb342",
                                color: "white",
                                border: "2px solid white",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor:
                                  loading || !selectedAmmoForApproval
                                    ? "not-allowed"
                                    : "pointer",
                              }}>
                              {loading ? "Processing..." : "Approve & Issue"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ammo Sub-tab */}
                {adminSubTab === "ammo" && (
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        marginBottom: "24px",
                        color: "#d4af37",
                      }}>
                      Ammo Inventory Management
                    </h2>

                    {/* Add New Ammo Form */}
                    <div
                      style={{
                        background: "rgba(124, 179, 66, 0.1)",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "24px",
                        border: "2px solid #7cb342",
                      }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          marginBottom: "16px",
                          color: "#d4af37",
                        }}>
                        Add New Ammunition
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr auto",
                          gap: "12px",
                          alignItems: "flex-end",
                        }}>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "500",
                              marginBottom: "6px",
                              color: "#d4af37",
                            }}>
                            Caliber
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 9mm, .45 ACP"
                            value={newAmmoCaliber}
                            onChange={(e) => setNewAmmoCaliber(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "2px solid #7cb342",
                              borderRadius: "6px",
                              fontSize: "14px",
                              backgroundColor: "#1a1a1a",
                              color: "#d4af37",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "14px",
                              fontWeight: "500",
                              marginBottom: "6px",
                              color: "#d4af37",
                            }}>
                            Quantity (rounds)
                          </label>
                          <input
                            type="number"
                            placeholder="Enter quantity"
                            value={newAmmoQuantity}
                            onChange={(e) => setNewAmmoQuantity(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              border: "2px solid #7cb342",
                              borderRadius: "6px",
                              fontSize: "14px",
                              backgroundColor: "#1a1a1a",
                              color: "#d4af37",
                            }}
                          />
                        </div>
                        <button
                          onClick={handleAddAmmo}
                          disabled={loading}
                          style={{
                            padding: "8px 20px",
                            background: loading ? "#556b2f" : "#7cb342",
                            color: "white",
                            border: "2px solid white",
                            borderRadius: "6px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}>
                          {loading ? "Adding..." : "Add Ammo"}
                        </button>
                      </div>
                    </div>

                    {/* Ammo List Table */}
                    {ammos && ammos.length > 0 ? (
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "2px solid #7cb342",
                        }}>
                        <thead>
                          <tr
                            style={{
                              background: "rgba(124, 179, 66, 0.2)",
                              borderBottom: "2px solid #7cb342",
                            }}>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              ID
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Caliber
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Quantity
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Created
                            </th>
                            <th
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                color: "#d4af37",
                              }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ammos.map((ammo: any) => (
                            <tr
                              key={ammo.id}
                              style={{
                                borderBottom: "1px solid #7cb342",
                                background: "rgba(0, 0, 0, 0.2)",
                              }}>
                              {editingAmmoId === ammo.id ? (
                                <>
                                  <td
                                    style={{
                                      padding: "12px",
                                      color: "#d4af37",
                                    }}>
                                    #{ammo.id}
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <input
                                      type="text"
                                      value={editCaliber}
                                      onChange={(e) =>
                                        setEditCaliber(e.target.value)
                                      }
                                      style={{
                                        width: "100%",
                                        padding: "6px 10px",
                                        border: "2px solid #7cb342",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                        backgroundColor: "#1a1a1a",
                                        color: "#d4af37",
                                      }}
                                    />
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <input
                                      type="number"
                                      value={editQuantity}
                                      onChange={(e) =>
                                        setEditQuantity(e.target.value)
                                      }
                                      style={{
                                        width: "100%",
                                        padding: "6px 10px",
                                        border: "2px solid #7cb342",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                        backgroundColor: "#1a1a1a",
                                        color: "#d4af37",
                                      }}
                                    />
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px",
                                      color: "#d4af37",
                                      fontSize: "14px",
                                    }}>
                                    {ammo.createdAt
                                      ? new Date(
                                          ammo.createdAt,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <div
                                      style={{ display: "flex", gap: "8px" }}>
                                      <button
                                        onClick={() =>
                                          handleUpdateAmmo(ammo.id)
                                        }
                                        disabled={loading}
                                        style={{
                                          padding: "6px 12px",
                                          background: loading
                                            ? "#556b2f"
                                            : "#7cb342",
                                          color: "white",
                                          border: "2px solid white",
                                          borderRadius: "4px",
                                          cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                        }}>
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEditingAmmo}
                                        disabled={loading}
                                        style={{
                                          padding: "6px 12px",
                                          background: "rgba(124, 179, 66, 0.2)",
                                          color: "#d4af37",
                                          border: "2px solid #7cb342",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                        }}>
                                        Cancel
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td
                                    style={{
                                      padding: "12px",
                                      color: "#d4af37",
                                    }}>
                                    #{ammo.id}
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px",
                                      fontWeight: "500",
                                      color: "#d4af37",
                                    }}>
                                    {ammo.caliber}
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px",
                                      color: "#d4af37",
                                    }}>
                                    {ammo.quantity.toLocaleString()} rounds
                                  </td>
                                  <td
                                    style={{
                                      padding: "12px",
                                      color: "#7cb342",
                                      fontSize: "14px",
                                    }}>
                                    {ammo.createdAt
                                      ? new Date(
                                          ammo.createdAt,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <div
                                      style={{ display: "flex", gap: "8px" }}>
                                      <button
                                        onClick={() => startEditingAmmo(ammo)}
                                        disabled={loading}
                                        style={{
                                          padding: "6px 12px",
                                          background: loading
                                            ? "#556b2f"
                                            : "#7cb342",
                                          color: "white",
                                          border: "2px solid white",
                                          borderRadius: "4px",
                                          cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                        }}>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteAmmo(ammo.id)
                                        }
                                        disabled={loading}
                                        style={{
                                          padding: "6px 12px",
                                          background: loading
                                            ? "#556b2f"
                                            : "#dc2626",
                                          color: "white",
                                          border: "2px solid white",
                                          borderRadius: "4px",
                                          cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                          fontSize: "12px",
                                          fontWeight: "500",
                                        }}>
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
                      <p
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#d4af37",
                          background: "rgba(0, 0, 0, 0.5)",
                          borderRadius: "8px",
                        }}>
                        No ammo inventory found
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}