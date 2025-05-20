
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full px-4 sm:container py-4 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
