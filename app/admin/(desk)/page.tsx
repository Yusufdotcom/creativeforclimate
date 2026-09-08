import Link from "next/link";
import { loadAdminDashboard } from "@/lib/admin-data";
import { inventoryLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { orders, artworks, requests, artists, errors } = await loadAdminDashboard();
  const pendingOrders = orders.filter((o) => o.order_status === "pending");
  const newRequests = requests.filter((r) => r.status === "new");

  return (
    <>
      <p className="eyebrow">STUDIO OVERVIEW</p>
      <h1>Make room for the work.</h1>
      <p className="lede">
        Manual Hormuud payment review, artwork inventory, and custom briefs — matching the Creative for Climate desk, not a generic
        dashboard.
      </p>
      <p className="admin-note">
        Payment is never auto-confirmed. Approving an order marks Hormuud payment as verified by a human and sets the artwork to
        sold. Phase 2 multi-artist marketplace remains off (`MULTI_ARTIST_MARKETPLACE=false`).
      </p>

      {(errors.orders || errors.artworks || errors.requests || errors.artists) && (
        <p className="form-error">
          Database notice: {[errors.orders, errors.artworks, errors.requests, errors.artists].filter(Boolean).join(" · ")}
        </p>
      )}

      <div className="admin-grid">
        <div className="admin-stat">
          <b>{String(pendingOrders.length).padStart(2, "0")}</b>
          <span>Pending orders</span>
        </div>
        <div className="admin-stat">
          <b>{String(artworks.length).padStart(2, "0")}</b>
          <span>Artworks</span>
        </div>
        <div className="admin-stat">
          <b>{String(newRequests.length).padStart(2, "0")}</b>
          <span>New requests</span>
        </div>
        <div className="admin-stat">
          <b>{String(artists.length).padStart(2, "0")}</b>
          <span>Artists</span>
        </div>
      </div>

      <section className="admin-panel">
        <h2>Needs attention</h2>
        {pendingOrders.length === 0 ? (
          <p className="admin-note">No pending Hormuud orders right now.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Artwork</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pendingOrders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td>
                    {order.reference_number}
                    <span className="meta">pending_verification</span>
                  </td>
                  <td>{order.artwork_title}</td>
                  <td>
                    {order.buyer_phone}
                    <span className="meta">{order.buyer_email || "no email"}</span>
                  </td>
                  <td>
                    ${Number(order.amount)} {order.currency}
                  </td>
                  <td>
                    <Link href="/admin/orders">Review →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-panel">
        <h2>Inventory pulse</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Status</th>
              <th>Publish</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {artworks.slice(0, 6).map((art) => (
              <tr key={art.id}>
                <td>{art.title}</td>
                <td>{art.artists?.display_name || "—"}</td>
                <td>
                  <span className="pill">{inventoryLabel(art.inventory_status)}</span>
                </td>
                <td>{art.publish_status}</td>
                <td>${Number(art.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
