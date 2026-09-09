/**
 * Public events noticeboard. Edit this list to publish the next campaign,
 * workshop, update, or publication before a database-backed editor is added.
 */
export const EVENTS = [
  {
    type: "CAMPAIGN / COMING SOON",
    title: "Plant, paint, protect.",
    description: "A community call to turn local climate care into public creative action.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=85",
    alt: "A young plant in a community garden.",
    featured: true,
  },
  {
    type: "WORKSHOP / UPCOMING",
    title: "Climate art lab",
    description: "Hands-on creative learning for children and young people.",
    image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
    alt: "Green plants growing in sunlight.",
    featured: false,
  },
] as const;
