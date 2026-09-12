import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLEDGE2WORTH | Sludge reuse assessment",
  description: "A hackathon decision-support prototype for exploring sludge reuse. Stage 4 illustrative screening; no reuse certification.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}




