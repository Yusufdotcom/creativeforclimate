import { reviewOrder } from "@/app/actions/admin/orders";
import { loadAdminDashboard } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { orders } = await loadAdminDashboard();

  return (
    <>
      <p className="eyebrow">HORMUUD REVIEW</p>
      <h1>Pending payments.</h1>
      <p className="lede">
        Each “Waan bixiyay” submission creates a pending order only. Confirm the Hormuud transfer yourself before approving.
      </p>

      <section className="admin-panel">
        <h2>Orders</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Artwork</th>
              <th>Buyer</th>
              <th>Payment</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  {order.reference_number}
                  <span className="meta">{new Date(order.created_at).toLocaleString()}</span>
                </td>
                <td>
                  {order.artwork_title}
                  <span className="meta">
                    ${Number(order.amount)} · {order.payment_method}
                  </span>
                </td>
                <td>
                  {order.buyer_phone}
                  <span className="meta">{order.buyer_email || "—"}</span>
                </td>
                <td>
                  <span className={`pill ${order.payment_status === "pending_verification" ? "warn" : "ok"}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td>{order.order_status}</td>
                <td>
                  {order.order_status === "pending" ? (
                    <div className="admin-actions">
                      <form action={reviewOrder}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="decision" value="approve" />
                        <button type="submit">Approve</button>
                      </form>
                      <form action={reviewOrder}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="decision" value="reject" />
                        <button type="submit" className="secondary">
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : (
                    <span className="meta">
                      {order.reviewed_by || "reviewed"}
                      {order.reviewed_at ? ` · ${new Date(order.reviewed_at).toLocaleDateString()}` : ""}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="admin-note">No orders yet.</p> : null}
      </section>
    </>
  );
}
