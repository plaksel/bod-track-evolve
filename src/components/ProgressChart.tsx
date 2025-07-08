import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface MeasurementEntry {
  id: string;
  date: string;
  measurements: Record<string, number>;
}

interface ProgressChartProps {
  data: MeasurementEntry[];
  selectedMeasurements: string[];
}

const measurementColors = {
  chest: '#10b981',
  biceps: '#3b82f6', 
  waist: '#f59e0b',
  thighs: '#ef4444',
  hips: '#8b5cf6',
  neck: '#06b6d4',
  forearms: '#f97316'
};

export function ProgressChart({ data, selectedMeasurements }: ProgressChartProps) {
  // Transform data for recharts
  const chartData = data.map(entry => {
    const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    return {
      date: formattedDate,
      ...entry.measurements
    };
  });

  if (data.length === 0) {
    return (
      <Card className="bg-fitness-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Add some measurements to see your progress!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-fitness-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progress Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              
              {selectedMeasurements.map((measurement) => (
                <Line
                  key={measurement}
                  type="monotone"
                  dataKey={measurement}
                  stroke={measurementColors[measurement as keyof typeof measurementColors]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={measurement.charAt(0).toUpperCase() + measurement.slice(1)}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}