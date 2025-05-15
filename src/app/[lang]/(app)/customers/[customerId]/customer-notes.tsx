"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Dictionary } from '@/lib/i18n/types'; // Import Dictionary type

// Define the structure for a fetched note
type CustomerNote = {
  id: string;
  note: string;
  created_at: string;
  // TODO: Add user details if needed later by joining profiles table
  // user_email: string | null;
};

interface CustomerNotesProps {
  customerId: string;
  isSuperuser: boolean;
  selectedTenantId: string | null;
  dictionary?: Dictionary['customers']; // Add dictionary prop back
}

export function CustomerNotes({ customerId, isSuperuser, selectedTenantId, dictionary }: CustomerNotesProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [notes, setNotes] = React.useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch notes
  const fetchNotes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("customer_notes")
        .select("id, note, created_at") // Fetch basic fields for now
        .eq("customer_id", customerId);

      // Apply tenant filter if superuser and a tenant is selected
      if (isSuperuser && selectedTenantId) {
        query = query.eq('tenant_id', selectedTenantId);
      }
      // Note: For non-superusers, RLS policies will automatically filter by their tenant_id

      const { data, error } = await query
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      console.error("Error fetching customer notes:", error);
      toast({
        title: dictionary?.customerDetails?.error || "Error loading notes",
        description: error.message || (dictionary?.customerDetails?.error || "Could not fetch customer notes."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [customerId, supabase, toast, dictionary]); // Added dictionary to dependencies

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Handle adding a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast({ title: dictionary?.customerDetails?.emptyNote || "Note cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
       // Get current user ID (important for linking the note)
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error("User not authenticated.");

       // Determine the tenant_id to use for the insert
       // Prioritize selectedTenantId for superusers, otherwise use user's profile tenant_id
       const tenantIdToUse = (isSuperuser && selectedTenantId) ? selectedTenantId : (await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()).data?.tenant_id;

       if (!tenantIdToUse) {
           throw new Error("Could not determine tenant ID for the new note.");
       }

      const { error } = await supabase
        .from("customer_notes")
        .insert([{
            customer_id: customerId,
            note: newNote.trim(),
            user_id: user.id, // Associate note with the logged-in user
            tenant_id: tenantIdToUse // Include the determined tenant_id
         }]);

      if (error) throw error;

      toast({ title: dictionary?.customerDetails?.addNoteSuccess || "Note added successfully." });
      setNewNote(""); // Clear input
      fetchNotes(); // Refresh notes list
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        title: dictionary?.customerDetails?.addNoteError || "Error adding note",
        description: error.message || (dictionary?.customerDetails?.addNoteError || "Could not save the note."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{dictionary?.customerDetails?.addNoteTitle || 'Add New Note'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={dictionary?.customerDetails?.notesPlaceholder || "Type your note here..."}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddNote} disabled={isSubmitting || !newNote.trim()}>
            {isSubmitting ? (dictionary?.customerDetails?.addingNote || "Adding...") : (dictionary?.customerDetails?.addNoteButton || "Add Note")}
          </Button>
        </CardFooter>
      </Card>

      <h3 className="text-lg font-semibold pt-4">{dictionary?.customerDetails?.existingNotesTitle || 'Existing Notes'}</h3>
      {isLoading ? (
        <p className="text-muted-foreground">{dictionary?.customerDetails?.loading || 'Loading notes...'}</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground">{dictionary?.customerDetails?.noData || 'No notes found for this customer.'}</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                <p className="text-xs text-muted-foreground pt-2">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  {/* TODO: Add user name/email here later */}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
