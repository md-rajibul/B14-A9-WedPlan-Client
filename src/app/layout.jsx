import "./globals.css";
export const metadata = {
  title: "WedPlan | Wedding Planning Platform",
  description: "Explore trusted wedding services and manage bookings with WedPlan."
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
