import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "../components/Mark";
import SubmitForm from "./SubmitForm";
import "./submit.css";

export const metadata: Metadata = {
  title: "Submit your artwork — Creative for Climate",
  description: "Artists: share your climate-inspired work with the Creative for Climate gallery.",
};

export default function SubmitArtworkPage() {
  return (
    <main className="submit-page">
      <header className="submit-top">
        <Link href="/" className="logo" aria-label="Creative for Climate home">
          <Mark />
        </Link>
        <Link href="/#gallery" className="text-link">
          Back to gallery
        </Link>
      </header>

      <div className="submit-body">
        <div className="submit-intro">
          <p className="eyebrow">OPEN CALL FOR ARTISTS</p>
          <h1>
            Show your work
            <br />
            <em>with us.</em>
          </h1>
          <p>
            Creative for Climate welcomes artists whose work speaks about people, place and the climate. Send us one artwork at a
            time.
          </p>
          <ol>
            <li>Fill in the form and attach a clear photo of the artwork.</li>
            <li>Our studio team reviews every submission.</li>
            <li>If it is a fit, we contact you to agree the price, then publish it in the gallery.</li>
          </ol>
        </div>

        <section className="submit-card">
          <SubmitForm />
        </section>
      </div>
    </main>
  );
}
