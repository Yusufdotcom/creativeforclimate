import { approveSubmission, declineSubmission } from "@/app/actions/admin/submissions";
import { requireAdminSession } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET_ORIGINALS } from "@/lib/supabase/env";
import type { Artist, ArtworkSubmission } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadSubmissions() {
  await requireAdminSession();
  const supabase = createServiceClient();

  const [submissions, artists] = await Promise.all([
    supabase.from("artwork_submissions").select("*").order("created_at", { ascending: false }),
    supabase.from("artists").select("id, display_name").order("display_name", { ascending: true }),
  ]);

  const rows = (submissions.data || []) as ArtworkSubmission[];

  // Submitted images live in the private bucket — short-lived links for review only.
  const imageUrls = new Map<string, string>();
  if (rows.length > 0) {
    const { data } = await supabase.storage.from(STORAGE_BUCKET_ORIGINALS).createSignedUrls(
      rows.map((row) => row.image_path),
      60 * 60
    );
    for (const item of data || []) {
      if (item.path && item.signedUrl) imageUrls.set(item.path, item.signedUrl);
    }
  }

  return {
    rows,
    imageUrls,
    artists: (artists.data || []) as Pick<Artist, "id" | "display_name">[],
    error: submissions.error?.message,
  };
}

function SubmissionImage({ url, title }: { url?: string; title: string }) {
  if (!url) return <span className="meta">Image unavailable</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" title="Open full size">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Submitted artwork: ${title}`}
        style={{ width: 140, height: 140, objectFit: "cover", border: "1px solid var(--line)", display: "block" }}
      />
    </a>
  );
}

export default async function AdminSubmissionsPage() {
  const { rows, imageUrls, artists, error } = await loadSubmissions();
  const waiting = rows.filter((row) => row.status === "new");
  const reviewed = rows.filter((row) => row.status !== "new");

  return (
    <>
      <p className="eyebrow">OPEN CALL</p>
      <h1>Artist submissions.</h1>
      <p className="lede">
        Work sent in by outside artists through the public “Submit your artwork” page. Nothing appears in the gallery until you
        approve it here.
      </p>

      {error ? (
        <p className="form-error">
          Database notice: {error}. If the table is missing, run supabase/migrations/005_artwork_submissions.sql in the Supabase
          SQL editor.
        </p>
      ) : null}

      <section className="admin-panel">
        <h2>Waiting for review ({waiting.length})</h2>
        {waiting.length === 0 ? (
          <p className="admin-note">No new submissions right now.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Artwork</th>
                <th>Artist</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {waiting.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <SubmissionImage url={imageUrls.get(sub.image_path)} title={sub.title} />
                  </td>
                  <td>
                    <b>{sub.title}</b>
                    <span className="meta">
                      {sub.medium} · {sub.dimensions}
                    </span>
                    <span className="meta">{sub.story}</span>
                    <span className="meta">
                      Asking: {sub.asking_price != null ? `$${Number(sub.asking_price)}` : "not stated"}
                    </span>
                    <span className="meta">
                      {sub.reference_number} · {new Date(sub.created_at).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {sub.artist_name}
                    <span className="meta">
                      {sub.phone}
                      {sub.email ? ` · ${sub.email}` : ""}
                    </span>
                    {sub.artist_bio ? <span className="meta">{sub.artist_bio}</span> : null}
                  </td>
                  <td>
                    <form action={approveSubmission} className="admin-form">
                      <input type="hidden" name="id" value={sub.id} />
                      <label>
                        Gallery price (USD)
                        <input
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          defaultValue={sub.asking_price != null ? Number(sub.asking_price) : undefined}
                        />
                      </label>
                      <label>
                        Artist profile
                        <select name="artistId" defaultValue="">
                          <option value="">Create new: {sub.artist_name}</option>
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id}>
                              Existing: {artist.display_name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="admin-actions">
                        <button type="submit" name="publishStatus" value="published">
                          Approve & publish
                        </button>
                        <button type="submit" name="publishStatus" value="draft" className="secondary">
                          Approve as draft
                        </button>
                      </div>
                    </form>
                    <form action={declineSubmission} className="admin-form" style={{ marginTop: 12 }}>
                      <input type="hidden" name="id" value={sub.id} />
                      <label>
                        Note <small>(optional, internal)</small>
                        <input name="adminNotes" />
                      </label>
                      <button type="submit" className="secondary">
                        Decline
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-panel">
        <h2>Reviewed</h2>
        {reviewed.length === 0 ? (
          <p className="admin-note">Nothing reviewed yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Artwork</th>
                <th>Artist</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {reviewed.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    {sub.reference_number}
                    <span className="meta">{new Date(sub.created_at).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <b>{sub.title}</b>
                    <span className="meta">
                      {sub.medium} · {sub.dimensions}
                    </span>
                  </td>
                  <td>
                    {sub.artist_name}
                    <span className="meta">
                      {sub.phone}
                      {sub.email ? ` · ${sub.email}` : ""}
                    </span>
                  </td>
                  <td>
                    <span className={`pill ${sub.status === "approved" ? "ok" : "warn"}`}>{sub.status}</span>
                    <span className="meta">
                      {sub.reviewed_by || "—"}
                      {sub.admin_notes ? ` · ${sub.admin_notes}` : ""}
                    </span>
                    {sub.status === "approved" ? (
                      <span className="meta">Manage price, inventory and publishing on the Artworks page.</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
