import { SITE_PHOTOS } from "./site-photos";

/**
 * Public events noticeboard. Edit this list to publish the next campaign,
 * workshop, update, or publication before a database-backed editor is added.
 */
export const EVENTS = [
  {
    type: "CAMPAIGN / FIELD NOTES",
    title: "Drawings for our shared home.",
    description: "School-based climate art with young people holding up stories of nature, oceans and the Somalia they want to protect.",
    image: SITE_PHOTOS.fieldNote.src,
    alt: SITE_PHOTOS.fieldNote.alt,
    featured: true,
  },
  {
    type: "WORKSHOP / IN SESSION",
    title: "Climate art lab",
    description: "Hands-on creative learning where mentors and children translate climate questions into colour on the page.",
    image: SITE_PHOTOS.hero.src,
    alt: SITE_PHOTOS.hero.alt,
    featured: false,
  },
  {
    type: "PARTNERSHIP / SDGs",
    title: "Goals rooted in community.",
    description: "Collaborating with partners to connect global sustainability goals with local creative climate action.",
    image: SITE_PHOTOS.partners.src,
    alt: SITE_PHOTOS.partners.alt,
    featured: false,
  },
] as const;
