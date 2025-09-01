import { Trophy, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Trophy className="text-accent text-2xl mr-3 h-8 w-8" />
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
