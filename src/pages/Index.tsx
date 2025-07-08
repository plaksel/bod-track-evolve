import { useState, useEffect } from "react";
import { MeasurementCard } from "@/components/MeasurementCard";
import { AddMeasurementForm } from "@/components/AddMeasurementForm";
import { ProgressChart } from "@/components/ProgressChart";
import { MeasurementFilter } from "@/components/MeasurementFilter";
import { Activity, Ruler, Heart, Zap, Target, Dumbbell, Flame } from "lucide-react";

interface MeasurementEntry {
  id: string;
  date: string;
  measurements: Record<string, number>;
}

const measurementIcons = {
  chest: <Heart className="h-4 w-4" />,
  biceps: <Flame className="h-4 w-4" />,
  waist: <Target className="h-4 w-4" />,
  thighs: <Dumbbell className="h-4 w-4" />,
  hips: <Activity className="h-4 w-4" />,
  neck: <Ruler className="h-4 w-4" />,
  forearms: <Zap className="h-4 w-4" />
};

const Index = () => {
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMeasurements = localStorage.getItem('fitness-measurements');
    if (savedMeasurements) {
      const parsed = JSON.parse(savedMeasurements);
      setMeasurements(parsed);
      
      // Set default selected measurements
      if (parsed.length > 0) {
        const allMeasurements = new Set<string>();
        parsed.forEach((entry: MeasurementEntry) => {
          Object.keys(entry.measurements).forEach(key => allMeasurements.add(key));
        });
        setSelectedMeasurements(Array.from(allMeasurements));
      }
    }
  }, []);

  // Save to localStorage whenever measurements change
  useEffect(() => {
    localStorage.setItem('fitness-measurements', JSON.stringify(measurements));
  }, [measurements]);

  const handleAddMeasurement = (newMeasurements: Record<string, number>) => {
    const entry: MeasurementEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      measurements: newMeasurements
    };
    
    setMeasurements(prev => [...prev, entry]);
    
    // Add new measurements to selected if not already there
    const newKeys = Object.keys(newMeasurements);
    setSelectedMeasurements(prev => {
      const updated = new Set([...prev, ...newKeys]);
      return Array.from(updated);
    });
  };

  const handleToggleMeasurement = (measurement: string) => {
    setSelectedMeasurements(prev => 
      prev.includes(measurement)
        ? prev.filter(m => m !== measurement)
        : [...prev, measurement]
    );
  };

  // Get latest measurements for cards
  const getLatestMeasurements = () => {
    if (measurements.length === 0) return {};
    return measurements[measurements.length - 1].measurements;
  };

  // Get previous measurements for change calculation
  const getPreviousMeasurements = () => {
    if (measurements.length < 2) return {};
    return measurements[measurements.length - 2].measurements;
  };

  // Calculate changes
  const calculateChange = (current: number, previous: number | undefined) => {
    if (previous === undefined) return undefined;
    return current - previous;
  };

  const latestMeasurements = getLatestMeasurements();
  const previousMeasurements = getPreviousMeasurements();

  // Get all available measurements for the filter
  const availableMeasurements = Array.from(
    new Set(measurements.flatMap(entry => Object.keys(entry.measurements)))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-fitness-highlight bg-clip-text text-transparent">
            Fitness Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your body measurements and visualize your fitness progress over time
          </p>
        </div>

        {/* Current Measurements Grid */}
        {Object.keys(latestMeasurements).length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Current Measurements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {Object.entries(latestMeasurements).map(([key, value]) => (
                <MeasurementCard
                  key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={value}
                  unit="cm"
                  change={calculateChange(value, previousMeasurements[key])}
                  icon={measurementIcons[key as keyof typeof measurementIcons]}
                />
              ))}
            </div>
          </>
        )}

        {/* Add Measurement Form */}
        <div className="mb-8">
          <AddMeasurementForm onSubmit={handleAddMeasurement} />
        </div>

        {/* Chart Filter */}
        {availableMeasurements.length > 0 && (
          <div className="mb-6">
            <MeasurementFilter
              availableMeasurements={availableMeasurements}
              selectedMeasurements={selectedMeasurements}
              onToggleMeasurement={handleToggleMeasurement}
            />
          </div>
        )}

        {/* Progress Chart */}
        <ProgressChart 
          data={measurements} 
          selectedMeasurements={selectedMeasurements}
        />

        {/* Tips */}
        <div className="mt-8 p-6 bg-fitness-card border border-border/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Measurement Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Consistency is key:</strong> Measure at the same time of day, preferably morning</li>
            <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
            <li>• <strong>Biceps:</strong> Measure at the largest part of your flexed bicep</li>
            <li>• <strong>Waist:</strong> Measure at the narrowest part, usually above the belly button</li>
            <li>• <strong>Thighs:</strong> Measure at the largest part of your thigh</li>
            <li>• <strong>Track regularly:</strong> Weekly measurements show the best progress trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
