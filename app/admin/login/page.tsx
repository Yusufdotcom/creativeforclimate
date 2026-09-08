"use client";

import { FormEvent, useState, useTransition } from "react";
import { adminLogin } from "@/app/actions/admin/auth";
import { Mark } from "@/app/components/Mark";
import "../admin.css";

export default function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result && !result.ok) setError(result.error);
    });
  };

  return (
    <div className="login-shell">
      <section className="login-card">
        <Mark />
        <p className="eyebrow" style={{ marginTop: 18 }}>
          PRIVATE ACCESS
        </p>
        <h1>Studio login</h1>
        <p>
          Sign in with an approved admin email. Hormuud payments are never auto-verified — review pending orders after you enter.
        </p>
        <form onSubmit={onSubmit}>
          <label>
            Email
            <input name="email" type="email" required autoComplete="username" />
          </label>
          <label>
            Password
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Enter studio"}
          </button>
        </form>
      </section>
    </div>
  );
}
