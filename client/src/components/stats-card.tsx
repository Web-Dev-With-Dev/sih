import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: "primary" | "secondary" | "accent" | "muted";
  trend?: {
    value: number;
    label: string;
  };
}

export default function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = "primary",
  trend 
}: StatsCardProps) {
  const getColorClasses = (colorType: string) => {
    switch (colorType) {
      case "primary":
        return "text-primary bg-primary/10";
      case "secondary":
        return "text-secondary bg-secondary/10";
      case "accent":
        return "text-accent bg-accent/10";
      case "muted":
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <motion.div
      className="bg-card p-6 rounded-lg border border-border"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground" data-testid={`stats-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </p>
          <motion.p 
            className="text-2xl font-bold text-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            data-testid={`stats-value-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {value}
          </motion.p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1" data-testid={`stats-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}