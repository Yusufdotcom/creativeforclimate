import type { Metadata } from "next";
import "./globals.css";
import "./logo-theme.css";
import "./high-end.css";

export const metadata: Metadata = {
  title: "Creative for Climate — Art that moves us",
  description: "A youth-led climate and creative arts initiative in Mogadishu, Somalia.",
  openGraph: { title: "Creative for Climate", description: "Art, education and climate action for Somalia's next generation.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
