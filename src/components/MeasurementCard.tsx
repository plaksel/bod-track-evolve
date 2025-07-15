import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Trash2 } from "lucide-react";

interface MeasurementCardProps {
  title: string;
  value: number;
  unit: string;
  change?: number;
  icon: React.ReactNode;
  date?: string;
  onDelete?: () => void;
}

export function MeasurementCard({ title, value, unit, change, icon, date, onDelete }: MeasurementCardProps) {
  const getTrendIcon = () => {
    if (!change || change === 0) return <Minus className="h-3 w-3" />;
    return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!change || change === 0) return "secondary";
    return change > 0 ? "default" : "destructive";
  };

  return (
    <Card className="bg-fitness-card border-border/50 hover:border-primary/20 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {date && (
            <p className="text-xs text-muted-foreground/70">
              {new Date(date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 text-primary">
            {icon}
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {value.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </div>
          </div>
          {change !== undefined && (
            <Badge variant={getTrendColor()} className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="text-xs">
                {change > 0 ? '+' : ''}{change.toFixed(1)}
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}