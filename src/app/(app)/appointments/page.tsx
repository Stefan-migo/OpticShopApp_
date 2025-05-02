"use client"; // Needs client-side interactivity

"use client"; // Needs client-side interactivity

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Calendar, dateFnsLocalizer, Views, type Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns'; // Use named imports
import { enUS } from 'date-fns/locale/en-US'; // Use named import
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

// Setup the localizer by providing the moment Object
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
    provider_name: string | null;
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

export default function AppointmentsPage() {
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
  const [currentView, setCurrentView] = React.useState<ViewType>(Views.MONTH); // Use ViewType here

  // Fetch appointments (memoized)
  const fetchAppointments = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("appointments")
      .select(`
          id, customer_id, appointment_time, duration_minutes, type, status, provider_name, notes,
          customers ( first_name, last_name )
      `)
      .order("appointment_time");

    if (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      setError("Failed to load appointments.");
      setEvents([]);
    } else {
      const formattedEvents = data?.map((appt) => {
        const startTime = new Date(appt.appointment_time);
        const endTime = new Date(startTime.getTime() + (appt.duration_minutes || 30) * 60000);
        const customer = (appt.customers && typeof appt.customers === 'object' && !Array.isArray(appt.customers))
          ? appt.customers as { first_name: string | null, last_name: string | null }
          : null;
        const customerName = customer
           ? `${customer.last_name || ''}${customer.last_name && customer.first_name ? ', ' : ''}${customer.first_name || ''}`.trim() || 'Unknown Customer'
           : 'Unknown Customer';
        return {
          id: appt.id,
          title: `${customerName} (${appt.type})`,
          start: startTime,
          end: endTime,
          resource: appt,
        };
      }) || [];
      setEvents(formattedEvents);
    }
    setIsLoading(false);
  }, [supabase]); // Dependency: supabase client

  // Initial fetch
  React.useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select(`
            id, customer_id, appointment_time, duration_minutes, type, status, provider_name, notes,
            customers ( first_name, last_name )
        `)
        // Optionally filter by date range later for performance
        .order("appointment_time");

      if (fetchError) {
        console.error("Error fetching appointments:", fetchError);
        setError("Failed to load appointments.");
        setEvents([]);
      } else {
        // Transform Supabase data into react-big-calendar event format
        const formattedEvents = data?.map((appt) => {
          const startTime = new Date(appt.appointment_time);
          const endTime = new Date(startTime.getTime() + (appt.duration_minutes || 30) * 60000);
          // Explicitly check and access customer data
          const customer = (appt.customers && typeof appt.customers === 'object' && !Array.isArray(appt.customers))
            ? appt.customers as { first_name: string | null, last_name: string | null }
            : null;
          const customerName = customer
             ? `${customer.last_name || ''}${customer.last_name && customer.first_name ? ', ' : ''}${customer.first_name || ''}`.trim() || 'Unknown Customer'
             : 'Unknown Customer';
          return {
            id: appt.id,
            title: `${customerName} (${appt.type})`, // Example title
            start: startTime,
            end: endTime,
            resource: appt, // Store original data
          };
        }) || [];
        setEvents(formattedEvents);
      }
      setIsLoading(false);
    };

    fetchAppointments();
  }, [fetchAppointments]); // Dependency: memoized fetch function

  // Handler for successful form submission
  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false); // Also close edit dialog on success
    setEditingAppointment(null);
    fetchAppointments(); // Refresh the calendar
  };

  // Handler for selecting an event on the calendar
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
      toast({ title: "Appointment deleted successfully." });
      fetchAppointments(); // Refresh calendar
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Error deleting appointment",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingAppointmentId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        {/* Add Appointment Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new appointment.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border shadow-sm rounded-lg p-4 h-[75vh]"> {/* Give calendar a height */}
        {isLoading ? (
            <p className="text-muted-foreground">Loading calendar...</p>
        ) : error ? (
             <p className="text-red-600">{error}</p>
        ) : (
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                onSelectEvent={handleSelectEvent}
                date={currentDate} // Control the current date
                view={currentView} // Control the current view
                onNavigate={handleNavigate} // Handle date navigation
                onView={handleViewChange} // Handle view changes
            />
        )}
      </div>

       {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingAppointment(null); // Clear state when closing
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Update the appointment details.
              </DialogDescription>
            </DialogHeader>
            {/* Pass initialData and add a delete button trigger */}
            <AppointmentForm initialData={editingAppointment} onSuccess={handleFormSuccess} />
             <Button
                variant="outline"
                className="mt-4 text-destructive hover:text-destructive"
                onClick={() => editingAppointment && openDeleteDialog(editingAppointment.id)}
                disabled={!editingAppointment}
             >
                Delete Appointment
             </Button>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                appointment record.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingAppointmentId(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Appointment
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
