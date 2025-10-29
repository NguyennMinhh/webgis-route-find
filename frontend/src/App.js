import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/maps/user/", {
      headers: {
        "Accept": "application/json"
      }
    })
    .then(res => {
      setUsers(res.data);
      console.log(res.data);
    })
    .catch(err => console.error("Error fetching user maps:", err));
  }, []);

  return (
    <div>
      <h1>User List</h1>
      {users.map(u => (
        <p key={u.id}>{u.username} — {u.age}</p>
      ))}
    </div>
  );
}

export default App;
