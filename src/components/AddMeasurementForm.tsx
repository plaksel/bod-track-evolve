import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface MeasurementData {
  chest: string;
  biceps: string;
  waist: string;
  thighs: string;
  hips: string;
  neck: string;
  forearms: string;
}

interface AddMeasurementFormProps {
  onSubmit: (measurements: Record<string, number>) => void;
}

export function AddMeasurementForm({ onSubmit }: AddMeasurementFormProps) {
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<MeasurementData>({
    chest: '',
    biceps: '',
    waist: '',
    thighs: '',
    hips: '',
    neck: '',
    forearms: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers, filtering out empty values
    const numericMeasurements: Record<string, number> = {};
    Object.entries(measurements).forEach(([key, value]) => {
      if (value.trim() !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          numericMeasurements[key] = numValue;
        }
      }
    });

    if (Object.keys(numericMeasurements).length === 0) {
      toast({
        title: "Please enter at least one measurement",
        description: "Fill in the measurements you want to track.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(numericMeasurements);
    
    // Reset form
    setMeasurements({
      chest: '',
      biceps: '',
      waist: '',
      thighs: '',
      hips: '',
      neck: '',
      forearms: ''
    });

    toast({
      title: "Measurements added!",
      description: "Your progress has been recorded.",
    });
  };

  const handleInputChange = (field: keyof MeasurementData, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fields = [
    { key: 'chest' as keyof MeasurementData, label: 'Chest', placeholder: 'e.g., 102.5' },
    { key: 'biceps' as keyof MeasurementData, label: 'Biceps', placeholder: 'e.g., 38.2' },
    { key: 'waist' as keyof MeasurementData, label: 'Waist', placeholder: 'e.g., 85.0' },
    { key: 'thighs' as keyof MeasurementData, label: 'Thighs', placeholder: 'e.g., 62.1' },
    { key: 'hips' as keyof MeasurementData, label: 'Hips', placeholder: 'e.g., 95.3' },
    { key: 'neck' as keyof MeasurementData, label: 'Neck', placeholder: 'e.g., 40.2' },
    { key: 'forearms' as keyof MeasurementData, label: 'Forearms', placeholder: 'e.g., 32.1' }
  ];

  return (
    <Card className="bg-fitness-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Measurements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label} (cm)
                </Label>
                <Input
                  id={field.key}
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={field.placeholder}
                  value={measurements[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
            ))}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Measurements
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}