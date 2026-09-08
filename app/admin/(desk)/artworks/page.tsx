import {
  setArtworkInventory,
  setArtworkPublish,
  uploadArtworkAsset,
  upsertArtwork,
} from "@/app/actions/admin/artworks";
import { loadAdminDashboard } from "@/lib/admin-data";
import { inventoryLabel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminArtworksPage() {
  const { artworks, artists } = await loadAdminDashboard();

  return (
    <>
      <p className="eyebrow">COLLECTION</p>
      <h1>Artworks & pricing.</h1>
      <p className="lede">
        Publish curated work, set inventory, and attach watermarked previews. Original files stay in the private storage bucket and
        are never exposed on the public site.
      </p>

      <section className="admin-panel">
        <h2>Create / update artwork</h2>
        <form action={upsertArtwork} className="admin-form grid-2">
          <label>
            Existing ID <small>(leave blank to create)</small>
            <input name="id" placeholder="uuid" />
          </label>
          <label>
            Artist
            <select name="artistId" required defaultValue={artists[0]?.id || ""}>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.display_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Medium
            <input name="medium" required />
          </label>
          <label>
            Dimensions
            <input name="dimensions" required />
          </label>
          <label>
            Price (USD)
            <input name="price" type="number" min="0" step="0.01" required />
          </label>
          <label>
            Inventory
            <select name="inventoryStatus" defaultValue="available">
              <option value="available">available</option>
              <option value="reserved">reserved</option>
              <option value="sold">sold</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label>
            Publish
            <select name="publishStatus" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label>
            Preview tone (CSS fallback)
            <select name="previewTone" defaultValue="rain">
              <option value="rain">rain</option>
              <option value="lightning">lightning</option>
              <option value="seeds">seeds</option>
              <option value="blue">blue</option>
            </select>
          </label>
          <label>
            Sort order
            <input name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="full">
            Story
            <textarea name="story" rows={3} />
          </label>
          <label>
            Preview path <small>(optional storage path)</small>
            <input name="previewPath" placeholder="artwork-id/preview-….jpg" />
          </label>
          <label>
            Original path <small>(private only)</small>
            <input name="originalPath" placeholder="artwork-id/original-….jpg" />
          </label>
          <div className="full">
            <button type="submit">Save artwork</button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <h2>Library</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Artwork</th>
              <th>Inventory</th>
              <th>Publish</th>
              <th>Files</th>
              <th>Quick actions</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((art) => (
              <tr key={art.id}>
                <td>
                  <b>{art.title}</b>
                  <span className="meta">
                    {art.artists?.display_name} · ${Number(art.price)} · {art.id}
                  </span>
                </td>
                <td>
                  <span className="pill">{inventoryLabel(art.inventory_status)}</span>
                </td>
                <td>{art.publish_status}</td>
                <td>
                  <span className="meta">preview: {art.preview_path || "CSS tone"}</span>
                  <span className="meta">original: {art.original_path ? "stored (private)" : "none"}</span>
                </td>
                <td>
                  <div className="admin-actions">
                    <form action={setArtworkInventory}>
                      <input type="hidden" name="id" value={art.id} />
                      <input type="hidden" name="inventoryStatus" value="available" />
                      <button type="submit" className="secondary">
                        Available
                      </button>
                    </form>
                    <form action={setArtworkInventory}>
                      <input type="hidden" name="id" value={art.id} />
                      <input type="hidden" name="inventoryStatus" value="reserved" />
                      <button type="submit" className="secondary">
                        Reserved
                      </button>
                    </form>
                    <form action={setArtworkInventory}>
                      <input type="hidden" name="id" value={art.id} />
                      <input type="hidden" name="inventoryStatus" value="sold" />
                      <button type="submit" className="secondary">
                        Sold
                      </button>
                    </form>
                    <form action={setArtworkPublish}>
                      <input type="hidden" name="id" value={art.id} />
                      <input type="hidden" name="publishStatus" value="published" />
                      <button type="submit">Publish</button>
                    </form>
                    <form action={setArtworkPublish}>
                      <input type="hidden" name="id" value={art.id} />
                      <input type="hidden" name="publishStatus" value="archived" />
                      <button type="submit" className="secondary">
                        Archive
                      </button>
                    </form>
                  </div>
                  <form action={uploadArtworkAsset} className="upload-row" style={{ marginTop: 10 }}>
                    <input type="hidden" name="artworkId" value={art.id} />
                    <label>
                      Preview upload
                      <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
                    </label>
                    <input type="hidden" name="kind" value="preview" />
                    <button type="submit" className="secondary">
                      Upload preview
                    </button>
                  </form>
                  <form action={uploadArtworkAsset} className="upload-row" style={{ marginTop: 8 }}>
                    <input type="hidden" name="artworkId" value={art.id} />
                    <label>
                      Original upload (private)
                      <input type="file" name="file" accept="image/*,application/pdf" required />
                    </label>
                    <input type="hidden" name="kind" value="original" />
                    <button type="submit">Upload original</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
