"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
// import { type Tables } from "../../lib/supabase/types/database.types"; // Import Tables type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card component for display

// Manually defined types based on Supabase schema
export type MedicalRecord = { // Export MedicalRecord
  chief_complaint: string | null;
  created_at: string | null;
  diagnosis: string | null;
  examination_findings: string | null;
  id: string;
  medical_history: string | null;
  notes: string | null;
  professional_id: string | null;
  record_date: string | null;
  treatment_plan: string | null;
  updated_at: string | null;
  profiles?: { full_name: string | null } | null; // Add profiles relationship type
};

export type Prescription = { // Export Prescription
  created_at: string | null;
  customer_id: string;
  expiry_date: string | null;
  id: string;
  medical_record_id: string | null;
  notes: string | null;
  od_params: any | null; // Use 'any' for JSONB for simplicity here
  os_params: any | null; // Use 'any' for JSONB for simplicity here
  prescriber_id: string | null;
  prescriber_name: string | null;
  prescription_date: string;
  type: 'glasses' | 'contact_lens'; // Manually define enum
  updated_at: string | null;
  profiles?: { full_name: string | null } | null; // Add profiles relationship type
};

import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

interface MedicalHistoryDisplayProps {
  customerId: string | null;
  // Remove dictionary prop as it will be accessed via context
  // dictionary: Dictionary | null | undefined;
}

export function MedicalHistoryDisplay({ customerId }: MedicalHistoryDisplayProps) { // Remove dictionary prop
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const dictionary = useDictionary(); // Get dictionary from context
  // const { toast } = useToast(); // Uncomment if you want to use toasts

  useEffect(() => {
    if (!customerId || !dictionary) { // Ensure customerId and dictionary are loaded before fetching data
      setMedicalRecords([]);
      setPrescriptions([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch medical records for the customer
        const { data: recordsData, error: recordsError } = await supabase
          .from("medical_records")
          .select("*, profiles(full_name)") // Select medical record fields and join with profiles to get professional name
          .eq("customer_id", customerId)
          .order("record_date", { ascending: false });

        if (recordsError) throw recordsError;
        setMedicalRecords(recordsData || []);

        // Fetch prescriptions for the customer
        const { data: prescriptionsData, error: prescriptionsError } = await supabase
          .from("prescriptions")
          .select("*, profiles(full_name)") // Select prescription fields and join with profiles to get prescriber name
          .eq("customer_id", customerId)
          .order("prescription_date", { ascending: false });

        if (prescriptionsError) throw prescriptionsError;
        setPrescriptions(prescriptionsData || []);

      } catch (error: any) { // Add type annotation for error
        console.error("Error fetching medical history:", error);
        // TODO: Display an error message to the user
        // Uncomment and use toast if needed
        // if (dictionary) { // Ensure dictionary is available before using it in toast
        //   toast({
        //     title: dictionary.medicalActions.history.fetchError || "Error loading medical history",
        //     description: error.message || dictionary.common.unexpectedError || "An unexpected error occurred.",
        //     variant: "destructive",
        //   });
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, [customerId, supabase, dictionary]); // Add dictionary to dependencies

  // --- CRITICAL CHECK (Guard Clause) ---
  // Ensure dictionary is loaded before rendering content that uses it
  if (!dictionary) {
    // You can return a loading indicator or null here
    return <div>Loading language resources...</div>; // Or <SomeLoadingSpinner />
  }
  // --- END OF CRITICAL CHECK ---

  // Now dictionary is guaranteed to be non-null and loaded

  if (!customerId) {
    return <div>{dictionary.medicalActions.history.selectCustomerMessage}</div>;
  }

  if (isLoading) {
    return <div>{dictionary.medicalActions.history.loading}</div>;
  }

  return (
    <div className="space-y-6">
      {medicalRecords.length === 0 && prescriptions.length === 0 ? (
        <div>{dictionary.medicalActions.history.noHistoryMessage}</div>
      ) : (
        <>
          {/* Display Medical Records */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{dictionary.medicalActions.history.medicalRecordsTitle}</h3>
            {medicalRecords.map((record) => (
              <Card key={record.id} className="mb-4">
                <CardHeader>
                  {/* TODO: Localize date formatting */}
                  <CardTitle>{dictionary.medicalActions.history.recordDateLabel}: {record.record_date}</CardTitle>
                   <div className="text-sm text-muted-foreground">{dictionary.medicalActions.history.professionalLabel}: {record.profiles?.full_name || dictionary.common.notAvailable}</div>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>{dictionary.medicalActions.history.chiefComplaintLabel}:</strong> {record.chief_complaint || dictionary.common.notAvailable}</p>
                  <p><strong>{dictionary.medicalActions.history.diagnosisLabel}:</strong> {record.diagnosis || dictionary.common.notAvailable}</p>
                  <p><strong>{dictionary.medicalActions.history.treatmentPlanLabel}:</strong> {record.treatment_plan || dictionary.common.notAvailable}</p>
                  <p><strong>{dictionary.medicalActions.history.notesLabel}:</strong> {record.notes || dictionary.common.notAvailable}</p>
                   {/* TODO: Link to related prescriptions */}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Display Prescriptions */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{dictionary.medicalActions.history.prescriptionsTitle}</h3>
            {prescriptions.map((prescription) => (
               <Card key={prescription.id} className="mb-4">
                <CardHeader>
                  {/* TODO: Localize date formatting */}
                  <CardTitle>{dictionary.medicalActions.history.prescriptionDateLabel}: {prescription.prescription_date}</CardTitle>
                   <div className="text-sm text-muted-foreground">{dictionary.medicalActions.history.typeLabel}: {prescription.type}</div> {/* TODO: Localize type text */}
                   <div className="text-sm text-muted-foreground">{dictionary.medicalActions.history.prescriberLabel}: {prescription.profiles?.full_name || dictionary.common.notAvailable}</div>
                </CardHeader>
                <CardContent className="text-sm">
                   <p><strong>{dictionary.medicalActions.history.notesLabel}:</strong> {prescription.notes || '-'}</p>
                   {/* Display OD/OS params */}
                   <div className="mt-2">
                       <h4 className="font-medium text-sm mb-1">{dictionary.medicalActions.history.odParamsTitle}:</h4>
                       {prescription.od_params ? (
                           <div className="text-xs ml-2">
                               {prescription.type === 'glasses' ? (
                                   <>
                                       <p><strong>{dictionary.medicalActions.history.sphLabel}:</strong> {prescription.od_params.sph ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.cylLabel}:</strong> {prescription.od_params.cyl ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.axisLabel}:</strong> {prescription.od_params.axis ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.addLabel}:</strong> {prescription.od_params.add ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.prismLabel}:</strong> {prescription.od_params.prism || '-'}</p>
                                   </>
                               ) : ( // contact_lens
                                   <>
                                       <p><strong>{dictionary.medicalActions.history.sphLabel}:</strong> {prescription.od_params.sph ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.cylLabel}:</strong> {prescription.od_params.cyl ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.axisLabel}:</strong> {prescription.od_params.axis ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.bcLabel}:</strong> {prescription.od_params.bc ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.diaLabel}:</strong> {prescription.od_params.dia ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.brandLabel}:</strong> {prescription.od_params.brand || '-'}</p>
                                   </>
                               )}
                           </div>
                       ) : (
                           <div className="text-xs ml-2">{dictionary.common.notAvailable}</div>
                       )}
                   </div>

                    <div className="mt-2">
                       <h4 className="font-medium text-sm mb-1">{dictionary.medicalActions.history.osParamsTitle}:</h4>
                       {prescription.os_params ? (
                           <div className="text-xs ml-2">
                               {prescription.type === 'glasses' ? (
                                   <>
                                       <p><strong>{dictionary.medicalActions.history.sphLabel}:</strong> {prescription.os_params.sph ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.cylLabel}:</strong> {prescription.os_params.cyl ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.axisLabel}:</strong> {prescription.os_params.axis ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.addLabel}:</strong> {prescription.os_params.add ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.prismLabel}:</strong> {prescription.os_params.prism || '-'}</p>
                                   </>
                               ) : ( // contact_lens
                                   <>
                                       <p><strong>{dictionary.medicalActions.history.sphLabel}:</strong> {prescription.os_params.sph ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.cylLabel}:</strong> {prescription.os_params.cyl ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.axisLabel}:</strong> {prescription.os_params.axis ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.bcLabel}:</strong> {prescription.os_params.bc ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.diaLabel}:</strong> {prescription.os_params.dia ?? '-'}</p>
                                       <p><strong>{dictionary.medicalActions.history.brandLabel}:</strong> {prescription.os_params.brand || '-'}</p>
                                   </>
                               )}
                           </div>
                       ) : (
                           <div className="text-xs ml-2">{dictionary.common.notAvailable}</div>
                       )}
                   </div>

                    {/* TODO: Link to related medical record */}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
