"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { submitArtwork, type SubmissionResult } from "@/app/actions/submissions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function SubmitForm() {
  const [result, setResult] = useState<Extract<SubmissionResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);

    const image = formData.get("image");
    if (image instanceof File && image.size > MAX_IMAGE_BYTES) {
      setError("The photo must be 5 MB or smaller.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitArtwork(formData);
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult(response);
    } catch {
      setError("Could not submit your artwork. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="success">
        <span>✓</span>
        <p className="eyebrow">SUBMISSION RECEIVED</p>
        <h2>Mahadsanid.</h2>
        <p>
          Reference <b>{result.referenceNumber}</b>
        </p>
        <p>{result.message}</p>
        <div className="submit-actions">
          <button className="button dark" onClick={() => setResult(null)}>
            Submit another <span>↗</span>
          </button>
          <Link className="text-link" href="/#gallery">
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <p className="eyebrow">ABOUT YOU</p>
      <div className="form-row">
        <label>
          Artist name
          <input required name="artistName" maxLength={120} placeholder="As it should appear in the gallery" />
        </label>
        <label>
          Phone / WhatsApp
          <input required name="phone" type="tel" maxLength={40} />
        </label>
      </div>
      <label>
        Email <small>(optional)</small>
        <input name="email" type="email" maxLength={200} />
      </label>
      <label>
        Short bio <small>(optional)</small>
        <textarea name="artistBio" maxLength={1000} rows={2} placeholder="Where you are based and what you make" />
      </label>

      <p className="eyebrow submit-divider">THE ARTWORK</p>
      <label>
        Title
        <input required name="title" maxLength={160} />
      </label>
      <div className="form-row">
        <label>
          Medium
          <input required name="medium" maxLength={120} placeholder="e.g. Acrylic on canvas" />
        </label>
        <label>
          Size
          <input required name="dimensions" maxLength={120} placeholder="e.g. 60 × 80 cm" />
        </label>
      </div>
      <label>
        The story behind it
        <textarea required name="story" maxLength={2000} rows={4} placeholder="What does this piece say about people, place or climate?" />
      </label>
      <div className="form-row">
        <label>
          Asking price in USD <small>(optional)</small>
          <input name="askingPrice" type="number" min="0" step="1" placeholder="We confirm with you first" />
        </label>
        <label>
          Photo of the artwork
          <input required name="image" type="file" accept="image/jpeg,image/png,image/webp" />
          <small>JPG, PNG or WebP, up to 5 MB</small>
        </label>
      </div>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div className="submit-hp" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="submit-check">
        <input required type="checkbox" name="rightsConfirmed" />
        <span>This is my own original work, and I allow Creative for Climate to display it on the website if approved.</span>
      </label>

      <p className="notice">
        Nothing is published automatically. Our team reviews each submission and contacts you before your artwork appears in the
        gallery. Your phone and email are only used by the studio.
      </p>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button dark" type="submit" disabled={submitting}>
        {submitting ? "Uploading…" : "Submit artwork"} <span>↗</span>
      </button>
    </form>
  );
}
