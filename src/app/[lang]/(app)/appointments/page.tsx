"use client"; // Needs client-side interactivity

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Calendar, dateFnsLocalizer, Views, type Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns'; // Use named imports
import { enUS } from 'date-fns/locale/en-US'; // Use named import
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js"; // Import User type
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Import AlertDialog
import { AppointmentForm } from "./appointment-form";
import { getDictionary } from '@/lib/i18n'; // Import getDictionary
import { Locale } from '@/lib/i18n/config'; // Import Locale
import { useParams, useSearchParams } from 'next/navigation'; // Import useParams and useSearchParams
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface


// Setup the localizer by providing the moment Object
// TODO: Localize localizer based on the active locale
const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define the structure for appointment data fetched from Supabase
// Export the type so it can be imported elsewhere
export type AppointmentData = {
  id: string;
  customer_id: string;
  appointment_time: string; // ISO string from Supabase
  duration_minutes: number;
  type: string;
  status: string;
  // provider_name: string | null; // Remove this
  provider_id: string | null; // Add this (assuming UUID can be represented as string)
  notes: string | null;
  // Correctly type the joined customer data as an object or null
  customers: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

// Define the structure for events used by react-big-calendar
interface CalendarEvent extends Event {
  id: string;
  resource?: any; // Can store original appointment data here
}

// Define a type for the possible view values based on the Views object keys
type ViewType = (typeof Views)[keyof typeof Views];

interface AppointmentsPageProps {
  isSuperuser: boolean; // Add isSuperuser prop
  userTenantId: string | null; // Add userTenantId prop
}

export default function AppointmentsPage({ isSuperuser, userTenantId }: AppointmentsPageProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<AppointmentData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = React.useState<string | null>(null);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [currentView, setCurrentView] = React.useState<ViewType>(Views.WEEK); // Default to Week view for slot selection
  const [selectedSlotStart, setSelectedSlotStart] = React.useState<Date | null>(null); // State for selected slot
  const [clinicSettings, setClinicSettings] = React.useState<any>(null); // State for clinic settings
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true); // Loading state for settings
  // Remove client-side user and isSuperuser state
  // const [user, setUser] = React.useState<User | null>(null); // State for logged-in user
  // const [isSuperuser, setIsSuperuser] = React.useState(false); // State for isSuperuser flag
  const params = useParams(); // Get params from URL
  const lang = params.lang as Locale; // Extract locale
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters


  // Fetch dictionary
  const [dictionary, setDictionary] = React.useState<Dictionary | null>(null); // Use Dictionary interface
  React.useEffect(() => {
    const fetchDictionary = async () => {
      const dict = await getDictionary(lang);
      setDictionary(dict);
    };
    fetchDictionary();
  }, [lang]); // Refetch dictionary if locale changes


  // Fetch clinic settings (now relies on userTenantId from props)
  React.useEffect(() => {
    const fetchData = async () => {
      // Only fetch if userTenantId is available for non-superusers,
      // or if user is superuser (allowing existing logic to handle tenantId param)
      if (!isSuperuser && !userTenantId) {
        console.warn("AppointmentsPage: Skipping settings fetch - No userTenantId and not superuser.");
        setIsLoadingSettings(false);
        return;
      }

      setIsLoadingSettings(true);
      try {
        // Fetch clinic settings - assuming clinic settings are also tenant-specific
        // and linked by tenant_id, or there's a default if userTenantId is null (superuser)
        let settingsQuery = supabase
            .from('clinic_settings')
            .select('working_hours, default_slot_duration_minutes');

        if (!isSuperuser && userTenantId) {
             settingsQuery = settingsQuery.eq('tenant_id', userTenantId);
        } else if (isSuperuser && tenantId) {
             // Superuser viewing a specific tenant's settings
             settingsQuery = settingsQuery.eq('tenant_id', tenantId);
        } else if (isSuperuser && !tenantId) {
             // Superuser viewing all settings (or default if applicable) - might need a different approach
             // For now, let's assume superusers see all or a default if superuser and no tenantId
             console.warn("Superuser viewing clinic settings without specific tenantId. Fetching all or default.");
             // Fetch all or a default - depending on schema
             // For now, let's fetch the first one found if superuser and no tenantId
             settingsQuery = settingsQuery.limit(1);
        } else {
             // This case should now be caught by the initial check
             console.error("AppointmentsPage: Unexpected state - No userTenantId and not superuser reached else block.");
             setClinicSettings(null);
             setIsLoadingSettings(false);
             return;
        }


        const { data: settingsData, error: settingsError } = await settingsQuery.maybeSingle(); // Use maybeSingle()

        if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw settingsError;
        }

        if (settingsData) {
          setClinicSettings(settingsData);
        } else {
          // Handle case where no settings are found for the user's clinic/tenant
          console.warn("No clinic settings found for this user/tenant.");
          setClinicSettings(null); // Explicitly set to null or a default structure
        }


      } catch (error: any) {
        console.error("Error fetching clinic settings:", error);
        toast({ title: dictionary?.appointments.loadSettingsErrorTitle || "Error loading settings", description: error.message || dictionary?.appointments.loadSettingsErrorDescription || "Could not load clinic settings.", variant: "destructive" }); // Use dictionary
      } finally {
        setIsLoadingSettings(false);
      }
    };
    // Fetch settings when userTenantId or isSuperuser changes
    fetchData();
  }, [supabase, toast, dictionary, isSuperuser, userTenantId, tenantId]); // Add dependencies


  // Fetch appointments (memoized function definition)
  const fetchAppointments = React.useCallback(async () => {
     // Only fetch if userTenantId is available for non-superusers,
     // or if user is superuser (allowing existing logic to handle tenantId param)
     if (!isSuperuser && !userTenantId) {
        console.warn("fetchAppointments called without necessary tenant context.");
        setIsLoading(false); // Ensure loading state is turned off
        setEvents([]); // Clear events or set to empty
        return;
     }

    // Make sure dictionary check is still relevant if needed here
    // (Though outer check + dependency array handles it)
    if (!dictionary) {
      console.warn("fetchAppointments called before dictionary loaded.");
      setIsLoading(false); // Ensure loading state is turned off
      setEvents([]); // Clear events or set to empty
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("appointments")
        .select(`
          id, customer_id, appointment_time, duration_minutes, type, status, provider_id, notes,
          customers ( first_name, last_name )
      `) // Corrected: removed provider_name, added provider_id if needed
        .order("appointment_time");

       // Apply tenant filter if user is superuser AND tenantId search parameter is present,
       // OR if user is NOT a superuser and userTenantId is available
      if (isSuperuser && tenantId) {
        query = query.eq('tenant_id', tenantId);
      } else if (!isSuperuser && userTenantId) {
         query = query.eq('tenant_id', userTenantId);
      }


      const { data, error: fetchError } = await query;


      if (fetchError) {
        console.error("Error fetching appointments:", fetchError);
        // Use dictionary safely here as it's a dependency
        setError(dictionary.appointments.fetchError || "Failed to load appointments.");
        setEvents([]);
      } else {
        // Transform Supabase data into react-big-calendar event format
        const formattedEvents = data?.map((appt: any) => { // Use any type temporarily for mapping flexibility
          const startTime = new Date(appt.appointment_time);
          const endTime = new Date(startTime.getTime() + (appt.duration_minutes || 30) * 60000);
          // Safely access customer data, handling potential array or null
          const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;

          const customerName = customer
            ? `${customer.last_name || ''}${customer.last_name && customer.first_name ? ', ' : ''}${customer.first_name || ''}`.trim() || (dictionary.common.unknownCustomer || 'Unknown Customer')
            : (dictionary.common.unknownCustomer || 'Unknown Customer');

          return {
            id: appt.id,
            title: `${customerName} (${appt.type})`, // Example title
            start: startTime,
            end: endTime,
            resource: appt, // Store original AppointmentData
          };
        }) || [];
        setEvents(formattedEvents);
      }
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      // Use dictionary safely here as it's a dependency
      setError(dictionary.appointments.fetchError || "Failed to load appointments.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
    // Pass dependency array as the second argument to useCallback
  }, [supabase, dictionary, isSuperuser, tenantId, userTenantId]); // Dependency: supabase client, dictionary, isSuperuser, tenantId, userTenantId

  // useEffect hook to *call* fetchAppointments when the component mounts
  // or when fetchAppointments itself changes (due to its dependencies changing)
  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Depend on the memoized fetchAppointments function



  const { minTime, maxTime } = React.useMemo((): { minTime: Date, maxTime: Date } => {
    let min = new Date(currentDate); // Use currentDate for min/max calculation
    min.setHours(0, 0, 0, 0); // Default to start of the day

    let max = new Date(currentDate); // Use currentDate for max calculation
    max.setHours(23, 59, 59, 999); // Default to end of the day

    if (clinicSettings?.working_hours) {
      const today = format(currentDate, 'EEEE').toLowerCase(); // Get full lowercase day name
      const dailyHours = clinicSettings.working_hours[today];

      if (dailyHours?.start) {
        const [startHour, startMinute] = dailyHours.start.split(':').map(Number);
        min = new Date(currentDate);
        min.setHours(startHour, startMinute, 0, 0);
      }

      if (dailyHours?.end) {
        const [endHour, endMinute] = dailyHours.end.split(':').map(Number);
        max = new Date(currentDate);
        max.setHours(endHour, endMinute, 0, 0);
      }
    } else {
      // If no settings or working hours, default to a reasonable range like 6 AM to 7 PM
      min = new Date(currentDate); // Use currentDate for default min/max
      min.setHours(6, 0, 0, 0);
      max = new Date(currentDate); // Use currentDate for default min/max
      max.setHours(19, 0, 0, 0);
    }


    return { minTime: min, maxTime: max };
  }, [clinicSettings, currentDate]); // Recalculate when settings or date changes


  // Handler for successful form submission
  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false); // Also close edit dialog on success
    setEditingAppointment(null);
    fetchAppointments(); // Refresh the calendar
  };

  // Handler for selecting an empty slot on the calendar
  const handleSelectSlot = React.useCallback((slotInfo: { start: Date; end: Date; slots: Date[] | string[]; action: 'select' | 'click' | 'doubleClick' }) => {
    // Only allow slot selection in Day or Week view
    if (currentView === Views.DAY || currentView === Views.WEEK) { // Corrected: Changed second Views.DAY to Views.WEEK
      // Check if it's a single click/drag selection, not clicking an existing event
      if (slotInfo.action === 'select' || slotInfo.action === 'click') {
        setSelectedSlotStart(slotInfo.start);
        setEditingAppointment(null); // Ensure we are adding, not editing
        setIsAddDialogOpen(true);
      }
    } else {
      toast({
        title: dictionary?.appointments.selectSlotToastTitle || "Select a Slot", // Use dictionary
        description: dictionary?.appointments.selectSlotToastDescription || "Please switch to Week or Day view to select a time slot.", // Use dictionary
        variant: "default"
      })
    }
  }, [currentView, toast, dictionary]); // Add dictionary to dependencies

  // Handler for selecting an existing event on the calendar
  const handleSelectEvent = (event: CalendarEvent) => {
    // event.resource contains the original AppointmentData
    setEditingAppointment(event.resource as AppointmentData);
    setIsEditDialogOpen(true);
  };

  // Handler for calendar navigation (Back, Next, Today)
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
    // Optionally re-fetch appointments if needed based on the new date range
  };

  // Handler for changing the calendar view (Month, Week, Day, Agenda)
  const handleViewChange = (newView: ViewType) => { // Use ViewType here
    setCurrentView(newView);
  };

  // Opens delete confirmation (likely called from within Edit dialog)
  const openDeleteDialog = (appointmentId: string) => {
    setDeletingAppointmentId(appointmentId);
    setIsDeleteDialogOpen(true);
    setIsEditDialogOpen(false); // Close edit dialog when opening delete confirmation
  };

  // Function to perform deletion
  const confirmDelete = async () => {
    if (!deletingAppointmentId) return;
    try {
      const { error: deleteError } = await supabase
        .from("appointments")
        .delete()
        .eq("id", deletingAppointmentId);
      if (deleteError) throw deleteError;
      toast({ title: dictionary?.appointments.deleteSuccess || "Appointment deleted successfully." }); // Use dictionary
      fetchAppointments(); // Refresh calendar
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      toast({
        title: dictionary?.appointments.deleteErrorTitle || "Error deleting appointment", // Use dictionary
        description: error.message || dictionary?.common.unexpectedError || "An unexpected error occurred.", // Use dictionary
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingAppointmentId(null);
    }
  };

  return (
    <>
      {isLoading || isLoadingSettings || !dictionary ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Loading...</h1>
          </div>
          <div className="border shadow-sm rounded-lg p-4 h-[75vh]">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Error</h1>
          </div>
          <div className="border shadow-sm rounded-lg p-4 h-[75vh]">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4"> {/* Container */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{dictionary.appointments.title || "Appointments"}</h1> {/* Use dictionary */}
            {/* Add Appointment Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> {dictionary.appointments.scheduleButton || "Schedule Appointment"} {/* Use dictionary */}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{dictionary.appointments.scheduleNewTitle || "Schedule New Appointment"}</DialogTitle> {/* Use dictionary */}
                </DialogHeader>
                <DialogDescription>
                  {dictionary.appointments.scheduleNewDescription || "Fill in the details to schedule a new appointment."} {/* Use dictionary */}
                </DialogDescription>
                {/* Pass selected slot time to the form */}
                <AppointmentForm
                  initialDateTime={selectedSlotStart ?? undefined}
                  onSuccess={handleFormSuccess}
                  clinicSettings={clinicSettings} // Pass clinic settings to the form
                  dictionary={dictionary} // Pass dictionary
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="border shadow-sm rounded-lg p-4 h-[75vh]"> {/* Give calendar a height */}
            <Calendar
              localizer={localizer} // TODO: Localize localizer
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]} // TODO: Localize view names
              onSelectEvent={handleSelectEvent}
              date={currentDate} // Control the current date
              view={currentView} // Control the current view
              onNavigate={handleNavigate} // Handle date navigation
              onView={handleViewChange} // Handle view changes
              selectable={true} // Enable slot selection
              onSelectSlot={handleSelectSlot} // Handle slot selection
              min={minTime} // Set minimum time based on working hours
              max={maxTime} // Set maximum time based on working hours (optional, added for completeness)
              step={clinicSettings?.default_slot_duration_minutes || 30} // Set step based on settings
              timeslots={Math.floor(60 / (clinicSettings?.default_slot_duration_minutes || 30))} // Calculate timeslots per hour
              // Add eventPropGetter to apply styles based on status
              eventPropGetter={(event) => {
                const appointment = event.resource as AppointmentData;
                let className = '';
                switch (appointment.status) {
                  case 'scheduled':
                    className = 'bg-blue-500 text-white'; // Example color for scheduled
                    break;
                  case 'confirmed':
                    className = 'bg-green-500 text-white'; // Example color for confirmed
                    break;
                  case 'completed':
                    className = 'bg-gray-500 text-white'; // Example color for completed
                    break;
                  case 'cancelled':
                    className = 'bg-red-500 text-white line-through'; // Example color for cancelled
                    break;
                  case 'no_show':
                    className = 'bg-yellow-500 text-black'; // Example color for no-show
                    break;
                  default:
                    className = 'bg-blue-500 text-white'; // Default color
                }
                return { className };
              }}
            />
          </div>

          {/* Edit Appointment Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingAppointment(null); // Clear state when closing
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{dictionary.appointments.editTitle || "Edit Appointment"}</DialogTitle> {/* Use dictionary */}
                <DialogDescription>
                  {dictionary.appointments.editDescription || "Update the appointment details."} {/* Use dictionary */}
                </DialogDescription>{/* Corrected closing tag */}
              </DialogHeader>{/* Corrected closing tag */}
              {/* Pass initialData for editing */}
              <AppointmentForm
                initialData={editingAppointment}
                onSuccess={handleFormSuccess}
                clinicSettings={clinicSettings} // Pass clinic settings to the form
                dictionary={dictionary} // Pass dictionary
              />
              <Button
                variant="outline"
                className="mt-4 text-destructive hover:text-destructive"
                onClick={() => editingAppointment && openDeleteDialog(editingAppointment.id)}
                disabled={!editingAppointment}
              >
                {dictionary.appointments.deleteButton || "Delete Appointment"} {/* Use dictionary */}
              </Button>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{dictionary.appointments.deleteConfirmTitle || "Are you absolutely sure?"}</AlertDialogTitle> {/* Use dictionary */}
                <AlertDialogDescription>
                  {dictionary.appointments.deleteConfirmDescription || "This action cannot be undone. This will permanently delete this appointment record."} {/* Use dictionary */}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingAppointmentId(null)}>{dictionary.common.cancel || "Cancel"}</AlertDialogCancel> {/* Use dictionary */}
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {dictionary.appointments.deleteButton || "Delete Appointment"} {/* Use dictionary */}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </>
  );
}
