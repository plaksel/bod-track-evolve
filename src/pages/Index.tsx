import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MeasurementCard } from "@/components/MeasurementCard";
import { AddMeasurementForm } from "@/components/AddMeasurementForm";
import { ProgressChart } from "@/components/ProgressChart";
import { MeasurementFilter } from "@/components/MeasurementFilter";
import { Activity, Ruler, Heart, Zap, Target, Dumbbell, Flame, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface MeasurementEntry {
  id: string;
  date: string;
  measurements: Record<string, number>;
}

interface DatabaseMeasurement {
  id: string;
  user_id: string;
  measurement_type: string;
  value: number;
  created_at: string;
}

const measurementIcons = {
  chest: <Heart className="h-4 w-4" />,
  biceps_left: <Flame className="h-4 w-4" />,
  biceps_right: <Flame className="h-4 w-4" />,
  waist: <Target className="h-4 w-4" />,
  thighs_left: <Dumbbell className="h-4 w-4" />,
  thighs_right: <Dumbbell className="h-4 w-4" />,
  weight: <Activity className="h-4 w-4" />
};

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load data from Supabase on mount
  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);

  const loadMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading measurements:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load your measurements. Using offline mode.",
          variant: "destructive"
        });
        // Fallback to localStorage
        loadFromLocalStorage();
        return;
      }

      // Group measurements by created_at date to match existing structure
      const groupedData = groupMeasurementsByDate(data || []);
      setMeasurements(groupedData);
      
      // Set default selected measurements
      if (groupedData.length > 0) {
        const allMeasurements = new Set<string>();
        groupedData.forEach((entry: MeasurementEntry) => {
          Object.keys(entry.measurements).forEach(key => allMeasurements.add(key));
        });
        setSelectedMeasurements(Array.from(allMeasurements));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedMeasurements = localStorage.getItem('fitness-measurements');
    if (savedMeasurements) {
      const parsed = JSON.parse(savedMeasurements);
      setMeasurements(parsed);
      
      if (parsed.length > 0) {
        const allMeasurements = new Set<string>();
        parsed.forEach((entry: MeasurementEntry) => {
          Object.keys(entry.measurements).forEach(key => allMeasurements.add(key));
        });
        setSelectedMeasurements(Array.from(allMeasurements));
      }
    }
  };

  const groupMeasurementsByDate = (data: DatabaseMeasurement[]): MeasurementEntry[] => {
    const grouped = data.reduce((acc, measurement) => {
      const date = measurement.created_at;
      if (!acc[date]) {
        acc[date] = {
          id: crypto.randomUUID(),
          date,
          measurements: {}
        };
      }
      acc[date].measurements[measurement.measurement_type] = measurement.value;
      return acc;
    }, {} as Record<string, MeasurementEntry>);

    return Object.values(grouped).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const handleAddMeasurement = async (newMeasurements: Record<string, number>) => {
    try {
      const measurementDate = new Date().toISOString();
      
      // Insert measurements into Supabase
      const measurementInserts = Object.entries(newMeasurements).map(([type, value]) => ({
        measurement_type: type,
        value: value,
        created_at: measurementDate,
        user_id: user?.id || ''
      }));

      const { error } = await supabase
        .from('measurements')
        .insert(measurementInserts);

      if (error) {
        throw error;
      }

      // Update local state
      const entry: MeasurementEntry = {
        id: crypto.randomUUID(),
        date: measurementDate,
        measurements: newMeasurements
      };
      
      setMeasurements(prev => [...prev, entry]);
      
      // Add new measurements to selected if not already there
      const newKeys = Object.keys(newMeasurements);
      setSelectedMeasurements(prev => {
        const updated = new Set([...prev, ...newKeys]);
        return Array.from(updated);
      });

      toast({
        title: "Measurements saved!",
        description: "Your progress has been recorded to the cloud.",
      });

    } catch (error) {
      console.error('Error saving measurements:', error);
      toast({
        title: "Error saving measurements",
        description: "Saved locally instead. Data will sync when connection is restored.",
        variant: "destructive"
      });
      
      // Fallback to localStorage
      const entry: MeasurementEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        measurements: newMeasurements
      };
      
      setMeasurements(prev => {
        const updated = [...prev, entry];
        localStorage.setItem('fitness-measurements', JSON.stringify(updated));
        return updated;
      });
      
      const newKeys = Object.keys(newMeasurements);
      setSelectedMeasurements(prev => {
        const updated = new Set([...prev, ...newKeys]);
        return Array.from(updated);
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const entryToDelete = measurements.find(entry => entry.id === entryId);
      if (!entryToDelete) return;

      // Delete all measurements for this entry from Supabase
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('created_at', entryToDelete.date);

      if (error) {
        throw error;
      }

      // Update local state
      setMeasurements(prev => prev.filter(entry => entry.id !== entryId));

      toast({
        title: "Entry deleted",
        description: "The measurement entry has been removed.",
      });

    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Failed to delete the measurement entry.",
        variant: "destructive"
      });
    }
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with user info */}
        <div className="flex items-center gap-4 justify-end">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user.email}
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-fitness-highlight bg-clip-text text-transparent">
              Fitness Tracker
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your body measurements and visualize your fitness progress over time
            </p>
          </div>
          
        </div>

        {/* Current Measurements Grid */}
        {Object.keys(latestMeasurements).length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Current Measurements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {Object.entries(latestMeasurements).map(([key, value]) => (
                <MeasurementCard
                  key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                  value={value}
                  unit={key === 'weight' ? 'kg' : 'cm'}
                  change={calculateChange(value, previousMeasurements[key])}
                  icon={measurementIcons[key as keyof typeof measurementIcons]}
                  date={measurements.length > 0 ? measurements[measurements.length - 1].date : undefined}
                  onDelete={measurements.length > 0 ? () => handleDeleteEntry(measurements[measurements.length - 1].id) : undefined}
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
