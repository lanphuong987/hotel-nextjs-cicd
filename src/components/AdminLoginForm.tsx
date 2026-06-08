"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    const result = (await response.json()) as { message?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(result.message || "Could not log in.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="adminLoginPage">
      <form className="adminLoginCard" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Content backend</p>
          <h1>Admin login</h1>
        </div>
        <label className="adminField">
          <span>Username</span>
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label className="adminField">
          <span>Password</span>
          <input
            autoComplete="current-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="adminPrimaryButton" disabled={status === "loading"} type="submit">
          {status === "loading" ? "Logging in..." : "Log in"}
        </button>
        {message ? <p className="adminStatus error">{message}</p> : null}
      </form>
    </main>
  );
}
