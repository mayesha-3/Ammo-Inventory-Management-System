import { useEffect, useState } from "react";
import * as api from "../services/api";

// Fetch ammo inventory from API
const getAmmoInventory = async () => {
  try {
    const res = await api.getAmmoInventory();
    return res;
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        ammo: [
          {
            id: 1,
            caliber: "9mm Parabellum",
            quantity: 5000,
            createdAt: "2025-01-21T10:30:00Z",
            lastUpdated: "2025-01-21T10:30:00Z",
          },
          {
            id: 2,
            caliber: "5.56x45mm NATO",
            quantity: 8500,
            createdAt: "2025-01-20T14:15:00Z",
            lastUpdated: "2025-01-20T14:15:00Z",
          },
          {
            id: 3,
            caliber: ".45 ACP",
            quantity: 2300,
            createdAt: "2025-01-19T09:00:00Z",
            lastUpdated: "2025-01-20T16:45:00Z",
          },
          {
            id: 4,
            caliber: "7.62x51mm NATO",
            quantity: 6200,
            createdAt: "2025-01-18T11:20:00Z",
            lastUpdated: "2025-01-19T13:30:00Z",
          },
          {
            id: 5,
            caliber: ".308 Winchester",
            quantity: 3800,
            createdAt: "2025-01-17T08:45:00Z",
            lastUpdated: "2025-01-18T10:00:00Z",
          },
          {
            id: 6,
            caliber: "12 Gauge",
            quantity: 4500,
            createdAt: "2025-01-16T15:30:00Z",
            lastUpdated: "2025-01-17T09:15:00Z",
          },
          {
            id: 7,
            caliber: ".40 S&W",
            quantity: 1900,
            createdAt: "2025-01-15T12:00:00Z",
            lastUpdated: "2025-01-16T14:20:00Z",
          },
          {
            id: 8,
            caliber: ".22 LR",
            quantity: 12000,
            createdAt: "2025-01-14T10:10:00Z",
            lastUpdated: "2025-01-15T11:30:00Z",
          },
        ],
      },
    };
  }
};

export default function AmmoPage() {
  const [ammo, setAmmo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [orderingItem, setOrderingItem] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  useEffect(() => {
    fetchAmmo();
  }, []);

  const fetchAmmo = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAmmoInventory();
      setAmmo(res.data.ammo || []);
    } catch (err) {
      setError("Failed to load ammunition inventory");
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (quantity: number) => {
    if (quantity > 5000)
      return { level: "High", color: "#22c55e", bg: "#dcfce7" };
    if (quantity > 2000)
      return { level: "Medium", color: "#eab308", bg: "#fef9c3" };
    return { level: "Low", color: "#ef4444", bg: "#fee2e2" };
  };

  const handleOrderAmmo = async () => {
    if (!orderingItem || !orderQuantity || orderQuantity < 1) {
      setError("Please enter a valid quantity");
      return;
    }

    setOrderSubmitting(true);
    setError("");
    setOrderSuccess("");
    
    try {
      await api.orderFromStock({
        ammoId: orderingItem.id,
        quantity: orderQuantity,
      });
      
      setOrderSuccess(`Order placed for ${orderQuantity} rounds of ${orderingItem.caliber}! Pending admin approval.`);
      setOrderingItem(null);
      setOrderQuantity(1);
      
      // Clear success message after 3 seconds
      setTimeout(() => setOrderSuccess(""), 3000);
    } catch (err: any) {
      setError("Failed to place order: " + (err.message || "Unknown error"));
    } finally {
      setOrderSubmitting(false);
    }
  };

  const filteredAndSortedAmmo = ammo
    .filter((a) => a.caliber.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "latest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "quantity-high") {
        return b.quantity - a.quantity;
      } else if (sortBy === "quantity-low") {
        return a.quantity - b.quantity;
      } else if (sortBy === "caliber") {
        return a.caliber.localeCompare(b.caliber);
      }
      return 0;
    });

  const totalRounds = ammo.reduce((sum, a) => sum + a.quantity, 0);
  const totalTypes = ammo.length;
  const lowStockCount = ammo.filter((a) => a.quantity <= 2000).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/wp2706117.jpg') !important",
        backgroundAttachment: "scroll",
        backgroundSize: "auto",
        backgroundRepeat: "repeat",
        padding: "0px, 0px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            padding: "32px",
            borderRadius: "12px",
            border: "3px solid white",
            marginBottom: "24px",
          }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#d4af37",
              margin: "0 0 8px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}>
            <span style={{ fontSize: "36px" }}>🎯</span>
            Ammunition Inventory
          </h1>
          <p
            style={{
              color: "#7cb342",
              margin: 0,
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            }}>
            Military Grade Inventory Management
          </p>
        </div>

        {/* Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              padding: "24px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}>
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
              Total Rounds
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              {totalRounds.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              across all calibers
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              padding: "24px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}>
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
              Caliber Types
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              {totalTypes}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              different calibers
            </div>
          </div>

          <div
            style={{
              background:
                lowStockCount > 0
                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              padding: "24px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}>
            <div
              style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
              Low Stock Alert
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              {lowStockCount}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
              {lowStockCount > 0
                ? "items need attention"
                : "all stock levels good"}
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            marginBottom: "24px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
          <div style={{ flex: "1 1 300px" }}>
            <input
              type="text"
              placeholder="🔍 Search by caliber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0ea5e9")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label
              style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                background: "white",
                cursor: "pointer",
                outline: "none",
              }}>
              <option value="latest">Latest Added</option>
              <option value="quantity-high">Highest Quantity</option>
              <option value="quantity-low">Lowest Quantity</option>
              <option value="caliber">Caliber (A-Z)</option>
            </select>
          </div>

          <button
            onClick={fetchAmmo}
            style={{
              padding: "10px 20px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#0284c7")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#0ea5e9")}>
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "16px",
              background: "#fee2e2",
              border: "2px solid #fca5a5",
              borderRadius: "8px",
              marginBottom: "24px",
              color: "#991b1b",
              fontWeight: "500",
            }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {orderSuccess && (
          <div
            style={{
              padding: "16px",
              background: "#dcfce7",
              border: "2px solid #86efac",
              borderRadius: "8px",
              marginBottom: "24px",
              color: "#166534",
              fontWeight: "500",
            }}>
            {orderSuccess}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              background: "white",
              padding: "60px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#64748b",
            }}>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                animation: "spin 2s linear infinite",
              }}>
              ⚙️
            </div>
            <p style={{ fontSize: "18px", margin: 0 }}>
              Loading ammunition inventory...
            </p>
          </div>
        ) : filteredAndSortedAmmo.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "60px",
              borderRadius: "12px",
              textAlign: "center",
            }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
            <h3 style={{ color: "#475569", margin: "0 0 8px 0" }}>
              No ammunition found
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              {searchTerm
                ? "Try adjusting your search"
                : "No ammunition available in inventory"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}>
            {filteredAndSortedAmmo.map((a) => {
              const stock = getStockLevel(a.quantity);
              return (
                <div
                  key={a.id}
                  style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    border: "2px solid #f1f5f9",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 16px rgba(0,0,0,0.12)";
                    e.currentTarget.style.borderColor = "#0ea5e9";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.08)";
                    e.currentTarget.style.borderColor = "#f1f5f9";
                  }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "16px",
                    }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#0f172a",
                        flex: 1,
                      }}>
                      {a.caliber}
                    </h3>
                    <span
                      style={{
                        padding: "6px 12px",
                        background: stock.bg,
                        color: stock.color,
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}>
                      {stock.level} Stock
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      marginBottom: "16px",
                    }}>
                    <span
                      style={{
                        fontSize: "36px",
                        fontWeight: "700",
                        color: "#0ea5e9",
                      }}>
                      {a.quantity.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        fontWeight: "500",
                      }}>
                      rounds
                    </span>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}>
                      <span style={{ fontSize: "16px" }}>📅</span>
                      <span>
                        <strong>Added:</strong>{" "}
                        {new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}>
                      <span style={{ fontSize: "16px" }}>🔄</span>
                      <span>
                        <strong>Updated:</strong>{" "}
                        {new Date(
                          a.lastUpdated || a.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid #f1f5f9",
                    }}>
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#475569",
                        textAlign: "center",
                        fontWeight: "500",
                        marginBottom: "12px",
                      }}>
                      ID: #{a.id}
                    </div>
                    <button
                      onClick={() => {
                        setOrderingItem(a);
                        setOrderQuantity(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#0ea5e9",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#0284c7")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = "#0ea5e9")
                      }>
                      📦 Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Modal */}
        {orderingItem && (
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
                background: "white",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
              }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: "0 0 16px 0",
                }}>
                Order Ammunition
              </h2>

              <div
                style={{
                  background: "#f0f9ff",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  borderLeft: "4px solid #0ea5e9",
                }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    marginBottom: "4px",
                  }}>
                  Selected Item
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}>
                  {orderingItem.caliber}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}>
                  Available: {orderingItem.quantity.toLocaleString()} rounds
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#374151",
                  }}>
                  Quantity to Order
                </label>
                <input
                  type="number"
                  min="1"
                  max={orderingItem.quantity}
                  value={orderQuantity}
                  onChange={(e) =>
                    setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}>
                  Enter a number between 1 and{" "}
                  {orderingItem.quantity.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}>
                <button
                  onClick={() => {
                    setOrderingItem(null);
                    setOrderQuantity(1);
                  }}
                  disabled={orderSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: orderSubmitting ? "not-allowed" : "pointer",
                    opacity: orderSubmitting ? 0.7 : 1,
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleOrderAmmo}
                  disabled={orderSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: orderSubmitting ? "#9ca3af" : "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: orderSubmitting ? "not-allowed" : "pointer",
                  }}>
                  {orderSubmitting ? "Submitting..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {!loading && filteredAndSortedAmmo.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "white",
              borderRadius: "8px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "14px",
            }}>
            Showing {filteredAndSortedAmmo.length} of {ammo.length} caliber
            types
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
