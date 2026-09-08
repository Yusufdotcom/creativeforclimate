"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { CONTACT_EMAIL, HORMUUD_RECIPIENT_NUMBER } from "../lib/site-config";

type Art = {
  id: number;
  title: string;
  artist: string;
  medium: string;
  size: string;
  price: number;
  status: "Available" | "Reserved" | "Sold";
  tone: string;
  story: string;
};

const seedArtworks: Art[] = [
  { id: 1, title: "After the Rain", artist: "Khadra Hussein Ali", medium: "Mixed media on canvas", size: "80 × 100 cm", price: 180, status: "Available", tone: "rain", story: "A love letter to the first green that returns after Mogadishu's rain." },
  { id: 2, title: "Hilaac / Lightning", artist: "Khadra Hussein Ali", medium: "Acrylic & collage", size: "60 × 80 cm", price: 145, status: "Available", tone: "lightning", story: "Electric possibility—young people turning climate anxiety into collective action." },
  { id: 3, title: "Seeds We Carry", artist: "Khadra Hussein Ali", medium: "Textile & ink", size: "50 × 70 cm", price: 120, status: "Reserved", tone: "seeds", story: "A portrait of girls holding stories, seeds, and futures in their hands." },
  { id: 4, title: "Blue Horizon", artist: "Khadra Hussein Ali", medium: "Digital print, edition of 20", size: "A2", price: 55, status: "Available", tone: "blue", story: "The Indian Ocean as witness, provider, and a horizon worth protecting." },
];

function Mark() {
  return (
    <div className="brand-logo">
      <Image src="/creative-for-climate-logo.jpg" alt="Creative for Climate" fill priority sizes="180px" />
    </div>
  );
}

function ArtCard({ art, onSelect }: { art: Art; onSelect: (a: Art) => void }) {
  return (
    <article
      className="art-card"
      onClick={() => onSelect(art)}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(art)}
    >
      <div className={`art-image ${art.tone}`}>
        <span className="watermark">CREATIVE FOR CLIMATE · PREVIEW</span>
        <span className="copyright">© {art.artist}</span>
      </div>
      <div className="art-meta">
        <div>
          <p className="eyebrow">{art.medium}</p>
          <h3>{art.title}</h3>
          <p>{art.artist}</p>
        </div>
        <div className="price">
          ${art.price}
          <small>{art.status}</small>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<Art | null>(null);
  const [payment, setPayment] = useState<Art | null>(null);
  const [orderSent, setOrderSent] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [artworks, setArtworks] = useState(seedArtworks);
  const [orderStatus, setOrderStatus] = useState<
    "Awaiting payment verification" | "Approved — artwork marked sold" | "Rejected — artwork available"
  >("Awaiting payment verification");

  /**
   * Manual payment workflow only:
   * "Waan bixiyay" marks a pending order in the UI.
   * It never claims automatic payment verification.
   *
   * PRODUCTION PHASE:
   * - Persist the pending order to Supabase/Postgres
   * - Notify admins via email/SMS
   * - Keep status as pending until a human reviews Hormuud payment
   */
  const submitOrder = (e: FormEvent) => {
    e.preventDefault();
    setOrderSent(true);
  };

  return (
    <main>
      <nav>
        <a href="#top" className="logo">
          <Mark />
        </a>
        <button className="menu" aria-label="Toggle menu" onClick={() => setMenu(!menu)}>
          MENU <i />
        </button>
        <div className={menu ? "links open" : "links"}>
          <a href="#about">About</a>
          <a href="#programs">Programs</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Connect</a>
          {/* PRODUCTION PHASE: gate Admin behind authentication */}
          <button className="admin-link" onClick={() => setAdmin(true)}>
            Admin
          </button>
        </div>
      </nav>

      <section id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            Mogadishu, Somalia <b>•</b> Est. 2025
          </p>
          <h1>
            Art can
            <br />
            <em>change</em> the climate.
          </h1>
          <p className="lede">A youth-led movement where creativity becomes climate education, community care and action.</p>
          <div className="actions">
            <a className="button dark" href="#gallery">
              Explore the art <span>↘</span>
            </a>
            <a className="text-link" href="#about">
              Our story <span>↓</span>
            </a>
          </div>
        </div>
        <div className="hero-art" onContextMenu={(e) => e.preventDefault()}>
          <div className="sun" />
          <div className="hero-watermark">
            CREATIVE FOR CLIMATE
            <br />
            CREATIVE FOR CLIMATE
            <br />
            CREATIVE FOR CLIMATE
          </div>
          <p>
            Dreaming in
            <br />
            green since 2025.
          </p>
        </div>
        <div className="scroll">
          SCROLL TO EXPLORE <span>↓</span>
        </div>
      </section>

      <section className="marquee">
        <div>
          CREATIVITY IS CLIMATE ACTION <i>✳</i> CREATIVITY IS CLIMATE ACTION <i>✳</i> CREATIVITY IS CLIMATE ACTION
        </div>
      </section>

      <section id="about" className="intro">
        <p className="section-no">01 / OUR WHY</p>
        <div>
          <h2>
            We make room for the next generation to imagine <em>more.</em>
          </h2>
          <p>
            Creative for Climate is a youth-led environmental initiative using art, creative education and community action to help children, girls and young people understand climate
            change—and lead the response.
          </p>
          <a href="#contact" className="text-link">
            Meet our movement <span>↗</span>
          </a>
        </div>
      </section>

      <section className="statement">
        <div className="orb" />
        <p>
          ART <i>+</i> EDUCATION <i>+</i> CLIMATE ACTION <i>+</i> YOUTH LEADERSHIP
        </p>
        <h2>Climate knowledge should feel alive.</h2>
      </section>

      <section id="programs" className="programs">
        <div className="program-head">
          <p className="section-no">02 / WHAT WE DO</p>
          <h2>
            Made for
            <br />
            <em>real change.</em>
          </h2>
        </div>
        <div className="program-list">
          {[
            ["01", "Climate art labs", "Hands-on workshops where children translate climate questions into visual stories."],
            ["02", "Girls create green", "Creative confidence, environmental learning and leadership for girls and young women."],
            ["03", "Community in colour", "Public art, campaigns and clean-up action rooted in local stories."],
            ["04", "Young climate voices", "Youth-led ideas, exhibitions and conversations that reach beyond the classroom."],
          ].map(([n, t, d]) => (
            <article className="program" key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
              <b>↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className="impact">
        <p className="section-no">03 / OUR RIPPLE</p>
        <div className="impact-grid">
          <div>
            <strong>01</strong>
            <p>creative language for complex climate realities</p>
          </div>
          <div>
            <strong>∞</strong>
            <p>possibilities when young people lead</p>
          </div>
          <div>
            <strong>1</strong>
            <p>shared home worth protecting</p>
          </div>
        </div>
        <p className="impact-copy">We are building a generation of environmentally conscious, creative young people who can shape a resilient future for Somalia.</p>
      </section>

      <section id="gallery" className="gallery">
        <div className="gallery-head">
          <div>
            <p className="section-no">04 / COLLECT WITH PURPOSE</p>
            <h2>
              Stories you
              <br />
              can <em>hold.</em>
            </h2>
          </div>
          <p>Every artwork funds the creative climate movement. Preview images are watermarked and optimized for viewing.</p>
        </div>
        {/* PRODUCTION PHASE: load artworks from Supabase/Postgres; serve only watermarked preview assets from storage */}
        <div className="art-grid">
          {artworks.map((a) => (
            <ArtCard art={a} key={a.id} onSelect={setSelected} />
          ))}
        </div>
        <button className="button light" onClick={() => setSelected(artworks[0])}>
          View all artworks <span>↘</span>
        </button>
      </section>

      <section className="custom">
        <div className="custom-visual">
          <span>
            YOUR IDEA
            <br />
            IN COLOUR
          </span>
        </div>
        <div>
          <p className="section-no">05 / COMMISSION AN ARTIST</p>
          <h2>
            Have an idea?
            <br />
            <em>Let’s make it art.</em>
          </h2>
          <p>Share the story, change or person you want to honour. Khadra and our creative network will follow up with possibilities, a timeline and a quote.</p>
          <button className="button dark" onClick={() => setRequestSent(true)}>
            Request custom art <span>↗</span>
          </button>
        </div>
      </section>

      <section className="partners">
        <p className="section-no">06 / BETTER TOGETHER</p>
        <h2>Bring climate creativity to your school, organisation or community.</h2>
        <a className="button dark" href="#contact">
          Partner with us <span>↗</span>
        </a>
      </section>

      <footer id="contact">
        <div>
          <Mark />
          <h2>
            Let’s make
            <br />
            <em>room for hope.</em>
          </h2>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
        </div>
        <div className="footer-info">
          <p>Mogadishu, Somalia</p>
          <p>
            Founder & CEO
            <br />
            <b>Khadra Hussein Ali</b>
          </p>
          <p>
            © 2025 Creative for Climate.
            <br />
            All artwork rights reserved.
          </p>
          {/* PRODUCTION PHASE: require admin authentication before opening this panel */}
          <button onClick={() => setAdmin(true)}>Private admin access</button>
        </div>
      </footer>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="modal art-detail" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className={`detail-image ${selected.tone}`} onContextMenu={(e) => e.preventDefault()}>
              <span className="watermark">CREATIVE FOR CLIMATE · LICENSED PREVIEW</span>
              <span>© {selected.artist} · ALL RIGHTS RESERVED</span>
            </div>
            <div className="detail-copy">
              <p className="eyebrow">ORIGINAL ARTWORK / {selected.status}</p>
              <h2>{selected.title}</h2>
              <p className="artist">by {selected.artist}</p>
              <p>{selected.story}</p>
              <dl>
                <div>
                  <dt>Medium</dt>
                  <dd>{selected.medium}</dd>
                </div>
                <div>
                  <dt>Dimensions</dt>
                  <dd>{selected.size}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>${selected.price} USD</dd>
                </div>
              </dl>
              <p className="protection-note">
                This is a protected, low-resolution preview. Screenshots cannot be stopped by a normal browser; watermarks, attribution and limited previews deter misuse. Originals are
                never publicly served.
              </p>
              {selected.status === "Available" ? (
                <button
                  className="button dark"
                  onClick={() => {
                    setPayment(selected);
                    setSelected(null);
                  }}
                >
                  Buy this artwork <span>↗</span>
                </button>
              ) : (
                <button className="button muted">{selected.status}</button>
              )}
            </div>
          </section>
        </div>
      )}

      {payment && (
        <div className="modal-backdrop">
          <section className="modal payment-modal">
            <button className="close" onClick={() => setPayment(null)}>
              ×
            </button>
            {orderSent ? (
              <div className="success">
                <span>✓</span>
                <p className="eyebrow">ORDER RECEIVED</p>
                <h2>Mahadsanid.</h2>
                <p>
                  Your order is <b>pending manual payment verification</b>. We will confirm using the phone number or email you supplied. Your artwork is temporarily reserved.
                </p>
                <button
                  className="button dark"
                  onClick={() => {
                    setPayment(null);
                    setOrderSent(false);
                  }}
                >
                  Back to gallery
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">SECURE YOUR ARTWORK</p>
                <h2>Pay with Hormuud</h2>
                <div className="payment-instructions">
                  <span>1</span>
                  <p>
                    Dial <b>*770#</b> on your Hormuud phone.
                  </p>
                  <span>2</span>
                  <p>
                    Send <b>${payment.price} USD</b> to <b>{HORMUUD_RECIPIENT_NUMBER}</b> (Creative for Climate).
                  </p>
                  <span>3</span>
                  <p>Return here to tell us you have paid.</p>
                </div>
                <p className="notice">
                  This is a manual payment flow. Clicking “Waan bixiyay” creates a pending order only. Payment is not automatically verified; an administrator will review your order
                  before confirmation.
                </p>
                <form onSubmit={submitOrder}>
                  <label>
                    Artwork
                    <input value={payment.title} readOnly />
                  </label>
                  <label>
                    Your Hormuud number
                    <input required placeholder="061 XXX XXXX" type="tel" />
                  </label>
                  <label>
                    Email <small>(optional)</small>
                    <input placeholder="you@email.com" type="email" />
                  </label>
                  <button className="button dark" type="submit">
                    Waan bixiyay <span>→</span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {requestSent && (
        <div className="modal-backdrop">
          <section className="modal request-modal">
            <button className="close" onClick={() => setRequestSent(false)}>
              ×
            </button>
            <p className="eyebrow">CUSTOM ART BRIEF</p>
            <h2>Tell us what you’re imagining.</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // PRODUCTION PHASE: save custom request to Supabase/Postgres and email/SMS the studio
                setRequestSent(false);
                alert("Mahadsanid! Your request has been sent for review.");
              }}
            >
              <label>
                What would you like created?
                <textarea required placeholder="A painting, mural, portrait, digital illustration…" />
              </label>
              <label>
                Theme or message
                <textarea required placeholder="The story, feeling or change it should express" />
              </label>
              <div className="form-row">
                <label>
                  Preferred size
                  <input placeholder="e.g. 60 × 80 cm" />
                </label>
                <label>
                  Style
                  <input placeholder="e.g. bold, abstract" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Budget
                  <input placeholder="Your budget in USD" type="number" />
                </label>
                <label>
                  Ideal deadline
                  <input type="date" />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Your name
                  <input required />
                </label>
                <label>
                  Phone number
                  <input required type="tel" />
                </label>
              </div>
              <label>
                Email <small>(optional)</small>
                <input type="email" />
              </label>
              <p className="notice">Your request will be reviewed by Khadra or a suitable artist. We will contact you to discuss feasibility, price and timeline before anything is confirmed.</p>
              <button className="button dark">
                Send my idea <span>↗</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {admin && (
        <div className="modal-backdrop">
          <section className="modal admin-modal">
            <button className="close" onClick={() => setAdmin(false)}>
              ×
            </button>
            <p className="eyebrow">PRIVATE / MVP DASHBOARD</p>
            <h2>Studio overview</h2>
            {/* PRODUCTION PHASE: require admin authentication; load real pending orders from the database */}
            <div className="admin-stats">
              <div>
                <b>{artworks.length.toString().padStart(2, "0")}</b>
                <span>Artworks</span>
              </div>
              <div>
                <b>{orderStatus.startsWith("Awaiting") ? "01" : "00"}</b>
                <span>Pending orders</span>
              </div>
              <div>
                <b>03</b>
                <span>Custom requests</span>
              </div>
            </div>
            <h3>Payment review</h3>
            <div className="admin-order">
              <div>
                <b>After the Rain</b>
                <span>Buyer: 061 XXX XXXX · $180</span>
                <small>{orderStatus}</small>
              </div>
              <button
                className="approve"
                disabled={!orderStatus.startsWith("Awaiting")}
                onClick={() => {
                  // PRODUCTION PHASE: update order + artwork status in Postgres; notify buyer by email/SMS
                  setOrderStatus("Approved — artwork marked sold");
                  setArtworks((items) => items.map((a) => (a.id === 1 ? { ...a, status: "Sold" } : a)));
                }}
              >
                Approve
              </button>
              <button
                className="reject"
                disabled={!orderStatus.startsWith("Awaiting")}
                onClick={() => {
                  setOrderStatus("Rejected — artwork available");
                  setArtworks((items) => items.map((a) => (a.id === 1 ? { ...a, status: "Available" } : a)));
                }}
              >
                Reject
              </button>
            </div>
            <h3>Artwork controls</h3>
            <div className="admin-order">
              <div>
                <b>Hilaac / Lightning</b>
                <span>Current status: {artworks.find((a) => a.id === 2)?.status}</span>
              </div>
              <button className="approve" onClick={() => setArtworks((items) => items.map((a) => (a.id === 2 ? { ...a, status: "Reserved" } : a)))}>
                Reserve
              </button>
              <button className="reject" onClick={() => setArtworks((items) => items.map((a) => (a.id === 2 ? { ...a, status: "Available" } : a)))}>
                Release
              </button>
            </div>
            <h3>Phase 2 marketplace</h3>
            {/* Gate with MULTI_ARTIST_MARKETPLACE=true in production when ready */}
            <p className="notice">
              Artist profiles, submissions, pricing and artist order tracking are designed as a future feature. Public artist onboarding is currently disabled
              (`MULTI_ARTIST_MARKETPLACE=false`).
            </p>
            <button className="button muted">Artist marketplace — coming soon</button>
          </section>
        </div>
      )}
    </main>
  );
}
