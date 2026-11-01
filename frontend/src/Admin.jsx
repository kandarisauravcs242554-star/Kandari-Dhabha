
import { useEffect, useState } from "react";
import "./Admin.css";

const API = "http://localhost:5000/api/orders";
const LOGIN_API = "http://localhost:5000/api/admin/login";

const statuses = [
  "Placed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function Admin() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function login(event) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch(LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.token) {
        throw new Error(result.message || "Login failed.");
      }

      // Keep the token in memory rather than browser storage.
      setToken(result.token);
      setPassword("");
    } catch (err) {
      setLoginError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    setToken("");
    setOrders([]);
    setError("");
    setLoginError("");
    setUsername("");
    setPassword("");
  }

  async function loadOrders(authToken = token) {
    if (!authToken) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        logout();
        setLoginError("Your login expired. Please log in again.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load orders.");
      }

      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    if (!token) return;

    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(`${API}/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        logout();
        setLoginError("Your login expired. Please log in again.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Status update failed.");
      }

      await loadOrders(token);
    } catch (err) {
      setError(err.message || "Could not update order status.");
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    if (token) {
      loadOrders(token);
    }
  }, [token]);

  const revenue = orders.reduce(
    (sum, order) =>
      ["Cancelled", "Canceled"].includes(order.status)
        ? sum
        : sum + Number(order.totalAmount ?? order.total ?? 0),
    0
  );

  const activeOrders = orders.filter(
    (order) =>
      !["Delivered", "Cancelled", "Canceled"].includes(order.status)
  ).length;

  // Show the login screen until authentication succeeds.
  if (!token) {
    return (
      <main className="admin-page">
        <section
          className="orders-panel"
          style={{ maxWidth: "460px", margin: "60px auto", padding: "28px" }}
        >
          <p className="admin-eyebrow">KANDARI DHABHA</p>
          <h1>Admin Login</h1>
          <p>Sign in to manage restaurant orders.</p>

          <form onSubmit={login} className="checkout-form">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              placeholder="Enter admin username"
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="Enter admin password"
            />

            {loginError && (
              <p className="admin-error" role="alert">
                {loginError}
              </p>
            )}

            <button
              className="refresh-btn"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">KANDARI DHABHA</p>
          <h1>Admin Dashboard</h1>
          <p>Manage restaurant orders and sales.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="refresh-btn"
            onClick={() => loadOrders(token)}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh Orders"}
          </button>
          <button className="refresh-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="admin-stats">
        <article className="stat-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </article>

        <article className="stat-card">
          <span>Active Orders</span>
          <strong>{activeOrders}</strong>
        </article>

        <article className="stat-card">
          <span>Sales Total</span>
          <strong>{formatMoney(revenue)}</strong>
        </article>
      </section>

      <section className="orders-panel">
        <div className="orders-heading">
          <div>
            <h2>Customer Orders</h2>
            <p>Review orders and update their status.</p>
          </div>
        </div>

        {loading && (
          <p className="admin-message">Loading orders...</p>
        )}

        {error && (
          <div className="admin-error" role="alert">
            {error}
            <button onClick={() => loadOrders(token)}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p className="admin-message">No orders found yet.</p>
        )}

        {!loading && orders.length > 0 && (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td title={order._id}>
                      #{String(order._id || "").slice(-6).toUpperCase()}
                    </td>
                    <td>{order.customerName || order.name || "Customer"}</td>
                    <td>{order.phone || "—"}</td>
                    <td>
                      {Array.isArray(order.items)
                        ? order.items.reduce(
                            (sum, item) =>
                              sum + Number(item.quantity || 1),
                            0
                          )
                        : 0}
                    </td>
                    <td>
                      {formatMoney(order.totalAmount ?? order.total)}
                    </td>
                    <td>
                      <span className="status-badge">
                        {order.status || "Placed"}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status || "Placed"}
                        disabled={updatingId === order._id}
                        onChange={(event) =>
                          updateStatus(order._id, event.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {updatingId === order._id && (
                        <small>Saving...</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="admin-footer">
        Kandari Dhabha · Restaurant Management
      </footer>
    </div>
  );
}
