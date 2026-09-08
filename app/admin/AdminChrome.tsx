import { adminLogout } from "@/app/actions/admin/auth";
import { Mark } from "@/app/components/Mark";
import AdminNav from "./AdminNav";
import "./admin.css";

export default function AdminChrome({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div className="admin-brand">
          <Mark />
          <div>
            <strong>Studio desk</strong>
            <small>Creative for Climate · private</small>
          </div>
        </div>
        <AdminNav />
        <div>
          <p className="admin-user">{email}</p>
          <form action={adminLogout}>
            <button
              type="submit"
              style={{
                background: "transparent",
                color: "inherit",
                border: 0,
                textDecoration: "underline",
                padding: 0,
                font: "11px var(--mono)",
                marginTop: 6,
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="admin-main">{children}</div>
    </div>
  );
}
