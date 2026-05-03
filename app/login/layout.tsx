import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - AquaNet",
  description: "Login to access your AquaNet dashboard and manage your aquaculture operations",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
