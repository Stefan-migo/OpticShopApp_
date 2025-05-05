"use client";

import { useEffect, useState } from 'react'; // Import hooks
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxRateManager } from "./tax-rate-manager"; // Import the new component
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Input } from "@/components/ui/input"; // Import Input
import { Button } from "@/components/ui/button"; // Import Button
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { createClient } from "@/lib/supabase/client"; // Import Supabase client
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { User } from "@supabase/supabase-js"; // Import User type

// TODO: Research other common application settings (e.g., theme, notifications, defaults)

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null); // State for logged-in user
  const [defaultSlotDuration, setDefaultSlotDuration] = useState<number | null>(null);
  // State for working hours, structured by day
  const [workingHours, setWorkingHours] = useState<{ [key: string]: { start: string; end: string } | null }>({
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null,
  });
  const [showWorkingHours, setShowWorkingHours] = useState(true); // State to control visibility
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch logged-in user and existing settings on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSettings(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(userData.user);

        if (userData.user) {
          const { data: settingsData, error: settingsError } = await supabase
            .from('clinic_settings')
            .select('id, default_slot_duration_minutes, working_hours') // Fetch id as well
            .eq('clinic_id', userData.user.id) // Filter by user's profile ID
            .maybeSingle(); // Use maybeSingle()

          if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
            throw settingsError;
          }

          if (settingsData) {
            setDefaultSlotDuration(settingsData.default_slot_duration_minutes);
            // Parse fetched JSON working hours into state structure
            if (settingsData.working_hours && Object.keys(settingsData.working_hours).length > 0) {
              setWorkingHours(settingsData.working_hours);
            } else {
              // If working_hours is null or an empty object, reset to default structure
              setWorkingHours({
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null,
                sunday: null,
              });
            }
          } else {
             // If no settings data found, initialize with default structure
             setWorkingHours({
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null,
                sunday: null,
              });
          }
        } else {
           // If no user, initialize with default structure
           setWorkingHours({
              monday: null,
              tuesday: null,
              wednesday: null,
              thursday: null,
              friday: null,
              saturday: null,
              sunday: null,
            });
        }

      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "Could not load user or appointment settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchData();
  }, [supabase, toast]);

  const handleSaveSettings = async () => {
    if (!user) {
      toast({
        title: "Error saving settings",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingSettings(true);
    try {
      // Assuming there's a single row for clinic settings per user, either update or insert
      const { data: existingSettings, error: fetchError } = await supabase
        .from('clinic_settings')
        .select('id')
        .eq('clinic_id', user.id) // Filter by user's profile ID
        .maybeSingle(); // Use maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchError;
      }

      const settingsData = {
        default_slot_duration_minutes: defaultSlotDuration,
        working_hours: workingHours, // Include working hours from state
      };

      if (existingSettings) {
        // Update existing row
        const { error: updateError } = await supabase
          .from('clinic_settings')
          .update(settingsData)
          .eq('clinic_id', user.id); // Filter by user's profile ID
        if (updateError) throw updateError;
      } else {
        // Insert new row
        const { error: insertError } = await supabase
          .from('clinic_settings')
          .insert([{ ...settingsData, clinic_id: user.id }]); // Include clinic_id on insert
        if (insertError) throw insertError;
      }

      toast({
        title: "Settings saved successfully.",
        variant: "default",
      });

    } catch (error: any) {
      console.error("Error saving clinic settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage application preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Placeholder for other settings */}
           <div>
             <h3 className="text-lg font-medium mb-2">General</h3>
             <p className="text-sm text-muted-foreground">General application settings will go here (e.g., theme switcher).</p>
           </div>

           <Separator />

           {/* Appointment Settings Section */}
           <div>
             <h3 className="text-lg font-medium mb-2">Appointment Settings</h3>
             <p className="text-sm text-muted-foreground mb-4">Configure settings related to appointment scheduling.</p>

             {/* Default Slot Duration Input */}
             <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Default Slot Duration (minutes)</label>
                <Input
                  type="number"
                  value={defaultSlotDuration ?? ''}
                  onChange={(e) => setDefaultSlotDuration(parseInt(e.target.value) || null)}
                  placeholder="e.g., 30"
                  disabled={isLoadingSettings}
                  className="mt-1"
                />
             </div>

             {/* Working Hours Inputs */}
             <div className="mt-4 space-y-2"> {/* Use space-y-2 for spacing between days */}
                <div className="flex items-center justify-between"> {/* Flex container for label and button */}
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Working Hours</label>
                  <Button
                    variant="link" // Use link variant for a less prominent button
                    size="sm"
                    onClick={() => setShowWorkingHours(!showWorkingHours)}
                    disabled={isLoadingSettings}
                    className="p-0 h-auto" // Remove padding and set height to auto
                  >
                    {showWorkingHours ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showWorkingHours && ( // Conditionally render based on state
                  <div className="space-y-2"> {/* Add space-y-2 here for spacing within the toggled section */}
                    {Object.keys(workingHours).map(day => (
                      <div key={day} className="grid grid-cols-3 gap-4 items-center">
                        <label className="text-sm capitalize">{day}</label> {/* Capitalize day name */}
                        <Input
                          type="time"
                          value={workingHours[day]?.start || ''}
                          onChange={(e) => setWorkingHours({
                            ...workingHours,
                            [day]: {
                              start: e.target.value,
                              end: workingHours[day]?.end || '', // Use existing end or empty string
                            }
                          })}
                          disabled={isLoadingSettings}
                        />
                        <Input
                          type="time"
                          value={workingHours[day]?.end || ''}
                          onChange={(e) => setWorkingHours({
                            ...workingHours,
                            [day]: {
                              start: workingHours[day]?.start || '', // Use existing start or empty string
                              end: e.target.value,
                            }
                          })}
                          disabled={isLoadingSettings}
                        />
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Save Button for Appointment Settings */}
             <div className="mt-6">
                <Button onClick={handleSaveSettings} disabled={isLoadingSettings || !user}> {/* Disable if loading or user is null */}
                    Save Appointment Settings
                </Button>
             </div>

           </div>

           <Separator />

           {/* Tax Rate Management Section */}
           <TaxRateManager />

        </CardContent>
      </Card>
    </div>
  );
}
