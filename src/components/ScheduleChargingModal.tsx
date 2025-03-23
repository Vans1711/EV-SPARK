
import { useState } from "react";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";
import { useSparkCoins } from "@/context/SparkCoinsContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ScheduleChargingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScheduleChargingModal = ({ open, onOpenChange }: ScheduleChargingModalProps) => {
  const { useCoins } = useSparkCoins();
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [station, setStation] = useState<string>("");
  
  const handleSchedule = () => {
    if (!date || !time || !station) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Schedule booking costs 50 coins
    const scheduled = useCoins(50, "Scheduled charging session");
    
    if (scheduled) {
      toast.success(`Charging session scheduled for ${date} at ${time}`);
      onOpenChange(false);
      
      // Reset form
      setDate("");
      setTime("");
      setStation("");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-ev-dark-100 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Schedule Charging Session</DialogTitle>
          <DialogDescription className="text-white/60">
            Book your charging slot in advance and earn rewards
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="station" className="text-white">Charging Station</Label>
            <Select value={station} onValueChange={setStation}>
              <SelectTrigger id="station" className="bg-ev-dark-200 border-white/10 text-white">
                <SelectValue placeholder="Select a station" />
              </SelectTrigger>
              <SelectContent className="bg-ev-dark-200 border-white/10 text-white">
                <SelectItem value="station1" className="focus:bg-ev-dark-300 focus:text-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ev-green-400" />
                    EV Spark Station #1
                  </div>
                </SelectItem>
                <SelectItem value="station2" className="focus:bg-ev-dark-300 focus:text-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ev-green-400" />
                    EV Spark Station #2
                  </div>
                </SelectItem>
                <SelectItem value="station3" className="focus:bg-ev-dark-300 focus:text-white">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-ev-green-400" />
                    EV Spark Station #3
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="text-white">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 bg-ev-dark-200 border-white/10 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time" className="text-white">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-10 bg-ev-dark-200 border-white/10 text-white"
              />
            </div>
          </div>
          
          <div className="bg-ev-dark-300/50 p-3 rounded-md mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-ev-green-400" />
                <span className="text-white">Booking fee</span>
              </div>
              <span className="text-white font-medium">50 Spark Coins</span>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Advanced booking helps us optimize our network. You'll earn 100 coins after completing this session.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 text-white hover:bg-white/5">
            Cancel
          </Button>
          <Button className="bg-ev-green-500 hover:bg-ev-green-600 text-white" onClick={handleSchedule}>
            Schedule & Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleChargingModal;
