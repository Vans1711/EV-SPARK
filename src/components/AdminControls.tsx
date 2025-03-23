import { useState } from 'react';
import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { populateSampleStations } from '@/utils/sampleStations';

interface AdminControlsProps {
  onDataPopulated?: () => void;
}

export default function AdminControls({ onDataPopulated }: AdminControlsProps) {
  const [loading, setLoading] = useState(false);
  
  const handlePopulateStations = async () => {
    setLoading(true);
    
    try {
      const result = await populateSampleStations();
      
      if (result.success) {
        toast.success('Sample stations added successfully!');
        if (onDataPopulated) {
          onDataPopulated();
        }
      } else {
        toast.error(`Failed to add sample stations: ${result.message}`);
      }
    } catch (err) {
      console.error('Error populating stations:', err);
      toast.error('An error occurred while adding sample stations');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handlePopulateStations}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Database className="h-4 w-4 mr-2" />
      {loading ? 'Adding Stations...' : 'Populate Sample Stations'}
    </Button>
  );
} 