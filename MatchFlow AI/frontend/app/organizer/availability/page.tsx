"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const [startupsRes, investorsRes] = await Promise.all([
          fetch(`${API_URL}/api/startups`),
          fetch(`${API_URL}/api/investors`)
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = type === "startup" 
        ? `${API_URL}/api/startups/${id}/availability`
        : `${API_URL}/api/investors/${id}/availability`;
        
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = participant.type === "startup" 
        ? `${API_URL}/api/startups/${selectedId}/availability`
        : `${API_URL}/api/investors/${selectedId}/availability`;
        
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
    return <div className="flex justify-center p-24"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  const selectedParticipant = participants.find(p => p.id === selectedId);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-4 border border-amber-500/20 shadow-sm">
          <CalendarClock className="w-4 h-4" />
          <span>Organizer Dashboard</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Participant Availability</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Configure which time slots startups and investors are available to meet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Participants Sidebar Panel */}
        <div className="col-span-1 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          <div className="bg-white/50 border-b border-white/60 p-5 px-6">
            <h2 className="text-lg font-bold text-[#1C1917]">Select Participant</h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Startups</div>
            {participants.filter(p => p.type === "startup").map(p => (
              <button
                key={p.id}
                onClick={() => selectParticipant(p.id, p.type)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all font-semibold ${
                  selectedId === p.id 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className={`w-5 h-5 ${selectedId === p.id ? 'text-amber-100' : 'text-slate-400'}`} />
                {p.name}
              </button>
            ))}
            
            <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest mt-6">Investors</div>
            {participants.filter(p => p.type === "investor").map(p => (
              <button
                key={p.id}
                onClick={() => selectParticipant(p.id, p.type)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all font-semibold ${
                  selectedId === p.id 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'hover:bg-white/60 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className={`w-5 h-5 ${selectedId === p.id ? 'text-amber-100' : 'text-slate-400'}`} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Grid Panel */}
        <div className="col-span-1 md:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-250px)]">
          <div className="bg-white/50 border-b border-white/60 p-5 px-8 flex flex-row items-center justify-between">
            <h2 className="text-xl font-bold text-[#1C1917]">
              {selectedParticipant ? `${selectedParticipant.name} - Availability` : 'Select a participant'}
            </h2>
            {selectedParticipant && (
              <Button 
                onClick={saveAvailability} 
                disabled={isSaving} 
                className="h-10 px-6 rounded-xl font-bold bg-[#1C1917] hover:bg-black text-white shadow-lg border-none"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-8">
            {!selectedParticipant ? (
              <EmptyState 
                title="No Participant Selected" 
                description="Choose a startup or investor from the list to configure their availability." 
              />
            ) : loadingAvailability ? (
              <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availability.map((slot, idx) => {
                  const startTime = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={slot.time_slot_id} 
                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        slot.available 
                          ? 'border-emerald-200 bg-emerald-50/50 shadow-sm' 
                          : 'border-white/80 bg-white/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                          slot.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="font-mono font-bold text-lg text-slate-800">
                          {startTime}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleSlot(slot.time_slot_id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                          slot.available 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20' 
                            : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {slot.available ? 'Available ✓' : 'Unavailable ✗'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
