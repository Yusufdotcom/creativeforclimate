import { upsertArtist } from "@/app/actions/admin/artists";
import { loadAdminDashboard } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const { artists } = await loadAdminDashboard();

  return (
    <>
      <p className="eyebrow">PEOPLE</p>
      <h1>Artist records.</h1>
      <p className="lede">
        Phase 1.5 is curated by Creative for Climate. Keep `public_enabled` false and `MULTI_ARTIST_MARKETPLACE=false` until Phase
        2 artist self-signup is intentional.
      </p>

      <section className="admin-panel">
        <h2>Create / update artist</h2>
        <form action={upsertArtist} className="admin-form grid-2">
          <label>
            Existing ID <small>(blank to create)</small>
            <input name="id" placeholder="uuid" />
          </label>
          <label>
            Approval
            <select name="approvalStatus" defaultValue="approved">
              <option value="approved">approved</option>
              <option value="pending">pending</option>
              <option value="rejected">rejected</option>
            </select>
          </label>
          <label className="full">
            Display name
            <input name="displayName" required />
          </label>
          <label className="full">
            Bio
            <textarea name="bio" rows={3} />
          </label>
          <label>
            Public profile enabled (Phase 2)
            <select name="publicEnabled" defaultValue="false">
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </label>
          <div className="full">
            <button type="submit">Save artist</button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <h2>Artists</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Approval</th>
              <th>Public</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id}>
                <td>
                  <b>{artist.display_name}</b>
                  <span className="meta">{artist.bio || "—"}</span>
                </td>
                <td>
                  <span className="pill">{artist.approval_status}</span>
                </td>
                <td>{artist.public_enabled ? "yes" : "no"}</td>
                <td>
                  <span className="meta">{artist.id}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
