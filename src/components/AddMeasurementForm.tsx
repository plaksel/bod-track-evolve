import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface MeasurementData {
  chest: string;
  biceps_left: string;
  biceps_right: string;
  waist: string;
  thighs_left: string;
  thighs_right: string;
  hips: string;
  neck: string;
  forearms_left: string;
  forearms_right: string;
}

interface AddMeasurementFormProps {
  onSubmit: (measurements: Record<string, number>) => void;
}

export function AddMeasurementForm({ onSubmit }: AddMeasurementFormProps) {
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<MeasurementData>({
    chest: '',
    biceps_left: '',
    biceps_right: '',
    waist: '',
    thighs_left: '',
    thighs_right: '',
    hips: '',
    neck: '',
    forearms_left: '',
    forearms_right: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers, filtering out empty values
    const numericMeasurements: Record<string, number> = {};
    Object.entries(measurements).forEach(([key, value]) => {
      if (value.trim() !== '') {
        value.replace(/,/g, '.');
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
      biceps_left: '',
      biceps_right: '',
      waist: '',
      thighs_left: '',
      thighs_right: '',
      hips: '',
      neck: '',
      forearms_left: '',
      forearms_right: ''
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

  const singleFields = [
    { key: 'chest' as keyof MeasurementData, label: 'Chest', placeholder: 'e.g., 102.5' },
    { key: 'waist' as keyof MeasurementData, label: 'Waist', placeholder: 'e.g., 85.0' },
    { key: 'hips' as keyof MeasurementData, label: 'Hips', placeholder: 'e.g., 95.3' },
    { key: 'neck' as keyof MeasurementData, label: 'Neck', placeholder: 'e.g., 40.2' }
  ];

  const pairedFields = [
    {
      title: 'Biceps',
      left: { key: 'biceps_left' as keyof MeasurementData, placeholder: 'e.g., 38.2' },
      right: { key: 'biceps_right' as keyof MeasurementData, placeholder: 'e.g., 38.2' }
    },
    {
      title: 'Thighs',
      left: { key: 'thighs_left' as keyof MeasurementData, placeholder: 'e.g., 62.1' },
      right: { key: 'thighs_right' as keyof MeasurementData, placeholder: 'e.g., 62.1' }
    },
    {
      title: 'Forearms',
      left: { key: 'forearms_left' as keyof MeasurementData, placeholder: 'e.g., 32.1' },
      right: { key: 'forearms_right' as keyof MeasurementData, placeholder: 'e.g., 32.1' }
    }
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Single measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {singleFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label} (cm)
                </Label>
                <Input
                  id={field.key}
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
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

          {/* Paired measurements */}
          {pairedFields.map((group) => (
            <div key={group.title} className="space-y-3">
              <Label className="text-sm font-medium">{group.title} (cm)</Label>
              <div className="grid grid-cols-2 gap-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor={group.left.key} className="text-xs text-muted-foreground">
                    Left (cm)
                  </Label>
                  <Input
                    id={group.left.key}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={group.left.placeholder}
                    value={measurements[group.left.key]}
                    onChange={(e) => handleInputChange(group.left.key, e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={group.right.key} className="text-xs text-muted-foreground">
                    Right (cm)
                  </Label>
                  <Input
                    id={group.right.key}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={group.right.placeholder}
                    value={measurements[group.right.key]}
                    onChange={(e) => handleInputChange(group.right.key, e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          ))}
          
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