import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!username.trim() || !password) {
      setErr("Login va parolni kiriting");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (caught) {
      setErr(
        caught instanceof Error ? caught.message : "Kirish bajarilmadi"
      );
    }
    setLoading(false);
  };

  return (
    <div className="page page--centered">
      <h1 className="title">Melissa</h1>
      <p className="muted">Tizimga kirish</p>
      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <span>Login</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="input"
          />
        </label>
        <label className="field">
          <span>Parol</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="input"
          />
        </label>
        {err ? <p className="err">{err}</p> : null}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Kutilmoqda…" : "Kirish"}
        </button>
      </form>
    </div>
  );
}
