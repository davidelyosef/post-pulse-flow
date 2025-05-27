
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="area">
        <ul className="circles">
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
          <li>in</li>
        </ul>
      </div>

      <Navbar />
      <main className="flex-1 w-full px-4 sm:container py-4 sm:py-6 md:py-8 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
