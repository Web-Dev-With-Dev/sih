import { Trophy, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import sihLogo from "@assets/generated_images/Smart_India_Hackathon_logo_728ee237.png";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img 
                src={sihLogo} 
                alt="Smart India Hackathon Logo" 
                className="h-12 w-auto mr-3"
                data-testid="sih-logo"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="header-title">
                  Smart India Hackathon 2025
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="header-subtitle">
                  Team Management Dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <a 
                href="#dashboard" 
                className="text-primary font-medium hover:text-primary/80 transition-colors"
                data-testid="nav-dashboard"
              >
                Dashboard
              </a>
              <a 
                href="#team" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-team"
              >
                Team
              </a>
              <a 
                href="#tasks" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-tasks"
              >
                Tasks
              </a>
              <a 
                href="#uploads" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-uploads"
              >
                Uploads
              </a>
            </nav>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="text-foreground h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
