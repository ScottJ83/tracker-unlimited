import "./globals.css";
import NavBar from "@/components/NavBar";
import ClientUsernameGate from "@/components/ClientUsernameGate";

export const metadata = {
  title: "Tracker Unlimited",
  description: "Star Wars Unlimited collection tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientUsernameGate>
          <NavBar />
          {children}
        </ClientUsernameGate>
      </body>
    </html>
  );
}
