import { getPublicArtworks } from "@/lib/artworks";
import { CONTACT_EMAIL, HORMUUD_RECIPIENT_NUMBER, WHATSAPP_NUMBER } from "@/lib/site-config";
import HomeExperience from "./components/HomeExperience";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const artworks = await getPublicArtworks();

  return (
    <HomeExperience
      artworks={artworks}
      contactEmail={CONTACT_EMAIL}
      hormuudNumber={HORMUUD_RECIPIENT_NUMBER}
      whatsappNumber={WHATSAPP_NUMBER}
    />
  );
}
