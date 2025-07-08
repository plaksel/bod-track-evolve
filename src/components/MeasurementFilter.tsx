import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";

interface MeasurementFilterProps {
  availableMeasurements: string[];
  selectedMeasurements: string[];
  onToggleMeasurement: (measurement: string) => void;
}

export function MeasurementFilter({ 
  availableMeasurements, 
  selectedMeasurements, 
  onToggleMeasurement 
}: MeasurementFilterProps) {
  if (availableMeasurements.length === 0) {
    return null;
  }

  return (
    <Card className="bg-fitness-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Chart Measurements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {availableMeasurements.map((measurement) => (
            <Badge
              key={measurement}
              variant={selectedMeasurements.includes(measurement) ? "default" : "secondary"}
              className="cursor-pointer transition-colors hover:bg-primary/80"
              onClick={() => onToggleMeasurement(measurement)}
            >
              {measurement.charAt(0).toUpperCase() + measurement.slice(1)}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click to toggle measurements in the chart
        </p>
      </CardContent>
    </Card>
  );
}