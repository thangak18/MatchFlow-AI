"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarClock, Building2, Users } from "lucide-react";
import { ErrorState, EmptyState } from "@/components/shared/StateBlocks";

type Participant = { id: string; name: string; type: "startup" | "investor" };
type SlotAvailability = { time_slot_id: string; start_time: string; end_time: string; available: boolean };

export default function AvailabilityPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<SlotAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const [startupsRes, investorsRes] = await Promise.all([
          fetch("http://localhost:8000/api/startups"),
          fetch("http://localhost:8000/api/investors")
        ]);
        
        if (!startupsRes.ok || !investorsRes.ok) throw new Error("Failed to fetch participants");
        
        const startups = await startupsRes.json();
        const investors = await investorsRes.json();
        
        const combined: Participant[] = [
          ...startups.map((s: any) => ({ id: s.id, name: s.company_name, type: "startup" })),
          ...investors.map((i: any) => ({ id: i.id, name: i.investor_name, type: "investor" }))
        ];
        
        setParticipants(combined);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipants();
  }, []);

  const selectParticipant = async (id: string, type: "startup" | "investor") => {
    setSelectedId(id);
    setLoadingAvailability(true);
    try {
      const endpoint = type === "startup" 
        ? `http://localhost:8000/api/startups/${id}/availability`
        : `http://localhost:8000/api/investors/${id}/availability`;
        
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch availability");
      
      const data = await res.json();
      setAvailability(data.availability);
    } catch (err) {
      console.error(err);
      alert("Error fetching availability");
    } finally {
      setLoadingAvailability(false);
    }
  };

  const toggleSlot = (slotId: string) => {
    setAvailability(availability.map(slot => 
      slot.time_slot_id === slotId ? { ...slot, available: !slot.available } : slot
    ));
  };

  const saveAvailability = async () => {
    if (!selectedId) return;
    
    const participant = participants.find(p => p.id === selectedId);
    if (!participant) return;
    
    setIsSaving(true);
    try {
      const endpoint = participant.type === "startup" 
        ? `http://localhost:8000/api/startups/${selectedId}/availability`
        : `http://localhost:8000/api/investors/${selectedId}/availability`;
        
      const payload = {
        slots: availability.map(s => ({ time_slot_id: s.time_slot_id, available: s.available }))
      };
      
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save availability");
      
      alert("Availability saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving availability");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  const selectedParticipant = participants.find(p => p.id === selectedId);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Organizer Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Participant Availability</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Configure which time slots startups and investors are available to meet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-1 shadow-sm border-border h-[calc(100vh-250px)] flex flex-col">
          <CardHeader className="border-b border-border bg-secondary/30 pb-4">
            <CardTitle className="text-lg">Select Participant</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Startups</div>
            {participants.filter(p => p.type === "startup").map(p => (
              <button
                key={p.id}
                onClick={() => selectParticipant(p.id, p.type)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  selectedId === p.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary/50 text-foreground'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {p.name}
              </button>
            ))}
            
            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mt-4">Investors</div>
            {participants.filter(p => p.type === "investor").map(p => (
              <button
                key={p.id}
                onClick={() => selectParticipant(p.id, p.type)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  selectedId === p.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-secondary/50 text-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                {p.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-sm border-border h-[calc(100vh-250px)] flex flex-col">
          <CardHeader className="border-b border-border bg-secondary/30 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {selectedParticipant ? `${selectedParticipant.name} - Availability` : 'Select a participant'}
            </CardTitle>
            {selectedParticipant && (
              <Button onClick={saveAvailability} disabled={isSaving} size="sm">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-6">
            {!selectedParticipant ? (
              <EmptyState 
                title="No Participant Selected" 
                description="Choose a startup or investor from the list to configure their availability." 
              />
            ) : loadingAvailability ? (
              <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-3">
                {availability.map((slot, idx) => {
                  const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={slot.time_slot_id} 
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        slot.available ? 'border-success/30 bg-success/5' : 'border-border bg-secondary/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-mono font-medium text-lg w-32">
                          {startTime}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Slot {idx + 1}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleSlot(slot.time_slot_id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                          slot.available 
                            ? 'bg-success text-success-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {slot.available ? 'Available ✓' : 'Unavailable ✗'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
