import { useEffect, useState } from "react";
import { getMe, getAllUsers } from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getMe().then((res) => setUser(res.data));
  }, []);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "moderator") {
      getAllUsers().then((res) => setUsers(res.data.users));
    }
  }, [user]);

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      {users.length > 0 && (
        <div>
          <h3>All Users</h3>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                {u.email} — {u.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
