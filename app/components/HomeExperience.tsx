"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { submitCustomRequest } from "@/app/actions/custom-requests";
import { submitHormuudOrder } from "@/app/actions/orders";
import type { PublicArtwork } from "@/lib/types";
import { Mark } from "./Mark";

type Props = {
  artworks: PublicArtwork[];
  contactEmail: string;
  hormuudNumber: string;
};

function ArtCard({ art, onSelect }: { art: PublicArtwork; onSelect: (a: PublicArtwork) => void }) {
  return (
    <article
      className="art-card"
      onClick={() => onSelect(art)}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(art)}
    >
      <div className={`art-image ${art.tone}`} onContextMenu={(e) => e.preventDefault()}>
        {art.previewUrl ? (
          // Protected preview only — originals are never served publicly
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art.previewUrl} alt="" className="preview-photo" draggable={false} />
        ) : null}
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

export default function HomeExperience({ artworks: initialArtworks, contactEmail, hormuudNumber }: Props) {
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<PublicArtwork | null>(null);
  const [payment, setPayment] = useState<PublicArtwork | null>(null);
  const [orderResult, setOrderResult] = useState<{ referenceNumber: string; message: string } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestResult, setRequestResult] = useState<{ referenceNumber: string; message: string } | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [artworks, setArtworks] = useState(initialArtworks);
  const [pending, startTransition] = useTransition();

  const firstAvailable = useMemo(
    () => artworks.find((a) => a.inventoryStatus === "available") || artworks[0] || null,
    [artworks]
  );

  const onSubmitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!payment) return;
    setOrderError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("artworkId", payment.id);
    startTransition(async () => {
      const result = await submitHormuudOrder(formData);
      if (!result.ok) {
        setOrderError(result.error);
        return;
      }
      setArtworks((items) =>
        items.map((item) =>
          item.id === payment.id
            ? { ...item, status: "Reserved", inventoryStatus: "reserved" }
            : item
        )
      );
      setOrderResult({ referenceNumber: result.referenceNumber, message: result.message });
    });
  };

  const onSubmitRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRequestError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitCustomRequest(formData);
      if (!result.ok) {
        setRequestError(result.error);
        return;
      }
      setRequestResult({ referenceNumber: result.referenceNumber, message: result.message });
    });
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
          <a className="admin-link" href="/admin/login">
            Admin
          </a>
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
            Creative for Climate is a youth-led environmental initiative using art, creative education and community action to help
            children, girls and young people understand climate change—and lead the response.
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

      <section className="field-note" aria-labelledby="field-note-heading">
        <div className="field-note-image">
          {/* Community documentation image supplied by Creative for Climate. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/stories/world-environment-day-2026.jpg" alt="Young climate leaders presenting environmental artwork at a World Environment Day event." />
        </div>
        <div className="field-note-copy">
          <p className="section-no">IN THE COMMUNITY / 2026</p>
          <h2 id="field-note-heading">Young voices,<br /><em>visible change.</em></h2>
          <p>Celebrating World Environment Day through art, conversation and youth-led climate imagination in Mogadishu.</p>
        </div>
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
        <div className="art-grid">
          {artworks.map((a) => (
            <ArtCard art={a} key={a.id} onSelect={setSelected} />
          ))}
        </div>
        {firstAvailable ? (
          <button className="button light" onClick={() => setSelected(firstAvailable)}>
            View all artworks <span>↘</span>
          </button>
        ) : null}
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
          <button
            className="button dark"
            onClick={() => {
              setRequestOpen(true);
              setRequestResult(null);
              setRequestError(null);
            }}
          >
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
          <a href={`mailto:${contactEmail}`}>{contactEmail} ↗</a>
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
          <a href="/admin/login">Private admin access</a>
        </div>
      </footer>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="modal art-detail" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className={`detail-image ${selected.tone}`} onContextMenu={(e) => e.preventDefault()}>
              {selected.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.previewUrl} alt="" className="preview-photo" draggable={false} />
              ) : null}
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
                  <dd>
                    ${selected.price} {selected.currency}
                  </dd>
                </div>
              </dl>
              <p className="protection-note">
                This is a protected, low-resolution preview. Screenshots cannot be stopped by a normal browser; watermarks,
                attribution and limited previews deter misuse. Originals are never publicly served.
              </p>
              {selected.inventoryStatus === "available" ? (
                <button
                  className="button dark"
                  onClick={() => {
                    setPayment(selected);
                    setOrderResult(null);
                    setOrderError(null);
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
            <button
              className="close"
              onClick={() => {
                setPayment(null);
                setOrderResult(null);
                setOrderError(null);
              }}
            >
              ×
            </button>
            {orderResult ? (
              <div className="success">
                <span>✓</span>
                <p className="eyebrow">ORDER RECEIVED</p>
                <h2>Mahadsanid.</h2>
                <p>
                  Reference <b>{orderResult.referenceNumber}</b>
                </p>
                <p>
                  Your order is <b>pending manual payment verification</b>. {orderResult.message} Your artwork is temporarily
                  reserved.
                </p>
                <button
                  className="button dark"
                  onClick={() => {
                    setPayment(null);
                    setOrderResult(null);
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
                    Send <b>${payment.price} USD</b> to <b>{hormuudNumber}</b> (Creative for Climate).
                  </p>
                  <span>3</span>
                  <p>Return here to tell us you have paid.</p>
                </div>
                <p className="notice">
                  This is a manual payment flow. Clicking “Waan bixiyay” creates a pending order only. Payment is not automatically
                  verified; an administrator will review your order before confirmation.
                </p>
                <form onSubmit={onSubmitOrder}>
                  <label>
                    Artwork
                    <input value={payment.title} readOnly name="artworkTitle" />
                  </label>
                  <label>
                    Your Hormuud number
                    <input required placeholder="061 XXX XXXX" type="tel" name="buyerPhone" />
                  </label>
                  <label>
                    Email <small>(optional)</small>
                    <input placeholder="you@email.com" type="email" name="buyerEmail" />
                  </label>
                  {orderError ? <p className="form-error">{orderError}</p> : null}
                  <button className="button dark" type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Waan bixiyay"} <span>→</span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {requestOpen && (
        <div className="modal-backdrop">
          <section className="modal request-modal">
            <button
              className="close"
              onClick={() => {
                setRequestOpen(false);
                setRequestResult(null);
                setRequestError(null);
              }}
            >
              ×
            </button>
            {requestResult ? (
              <div className="success">
                <span>✓</span>
                <p className="eyebrow">REQUEST RECEIVED</p>
                <h2>Mahadsanid.</h2>
                <p>
                  Reference <b>{requestResult.referenceNumber}</b>
                </p>
                <p>{requestResult.message}</p>
                <button className="button dark" onClick={() => setRequestOpen(false)}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">CUSTOM ART BRIEF</p>
                <h2>Tell us what you’re imagining.</h2>
                <form onSubmit={onSubmitRequest}>
                  <label>
                    What would you like created?
                    <textarea required name="requestedArtwork" placeholder="A painting, mural, portrait, digital illustration…" />
                  </label>
                  <label>
                    Theme or message
                    <textarea required name="themeMessage" placeholder="The story, feeling or change it should express" />
                  </label>
                  <div className="form-row">
                    <label>
                      Preferred size
                      <input name="preferredSize" placeholder="e.g. 60 × 80 cm" />
                    </label>
                    <label>
                      Style
                      <input name="style" placeholder="e.g. bold, abstract" />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Budget
                      <input name="budget" placeholder="Your budget in USD" type="number" min="0" step="1" />
                    </label>
                    <label>
                      Ideal deadline
                      <input name="deadline" type="date" />
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Your name
                      <input required name="name" />
                    </label>
                    <label>
                      Phone number
                      <input required name="phone" type="tel" />
                    </label>
                  </div>
                  <label>
                    Email <small>(optional)</small>
                    <input name="email" type="email" />
                  </label>
                  <p className="notice">
                    Your request will be reviewed by Khadra or a suitable artist. We will contact you to discuss feasibility, price
                    and timeline before anything is confirmed.
                  </p>
                  {requestError ? <p className="form-error">{requestError}</p> : null}
                  <button className="button dark" disabled={pending}>
                    {pending ? "Sending…" : "Send my idea"} <span>↗</span>
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
