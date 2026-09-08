import { updateCustomRequestStatus } from "@/app/actions/admin/requests";
import { loadAdminDashboard } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

const statuses = ["new", "in_review", "quoted", "accepted", "declined", "completed"] as const;

export default async function AdminRequestsPage() {
  const { requests } = await loadAdminDashboard();

  return (
    <>
      <p className="eyebrow">COMMISSIONS</p>
      <h1>Custom art requests.</h1>
      <p className="lede">Every brief gets a reference number. Initial status is always “new” until the studio responds.</p>

      <section className="admin-panel">
        <h2>Requests</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Brief</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>
                  {req.reference_number}
                  <span className="meta">{new Date(req.created_at).toLocaleString()}</span>
                </td>
                <td>
                  <b>{req.requested_artwork}</b>
                  <span className="meta">{req.theme_message}</span>
                  <span className="meta">
                    {[req.preferred_size, req.style, req.budget != null ? `$${req.budget}` : null, req.deadline]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </td>
                <td>
                  {req.name}
                  <span className="meta">
                    {req.phone}
                    {req.email ? ` · ${req.email}` : ""}
                  </span>
                </td>
                <td>
                  <span className={`pill ${req.status === "new" ? "warn" : "ok"}`}>{req.status}</span>
                </td>
                <td>
                  <form action={updateCustomRequestStatus} className="admin-form">
                    <input type="hidden" name="id" value={req.id} />
                    <label>
                      Status
                      <select name="status" defaultValue={req.status}>
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Notes
                      <input name="adminNotes" defaultValue={req.admin_notes || ""} />
                    </label>
                    <button type="submit">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 ? <p className="admin-note">No custom requests yet.</p> : null}
      </section>
    </>
  );
}
