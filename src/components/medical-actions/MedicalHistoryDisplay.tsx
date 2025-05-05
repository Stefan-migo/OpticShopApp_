"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
// import { type Tables } from "../../lib/supabase/types/database.types"; // Import Tables type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card component for display

// Manually defined types based on Supabase schema
export type MedicalRecord = { // Export MedicalRecord
  chief_complaint: string | null;
  created_at: string | null;
  customer_id: string | null;
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

interface MedicalHistoryDisplayProps {
  customerId: string | null;
}

export function MedicalHistoryDisplay({ customerId }: MedicalHistoryDisplayProps) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!customerId) {
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

      } catch (error) {
        console.error("Error fetching medical history:", error);
        // TODO: Display an error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId, supabase]);

  if (!customerId) {
    return <div>Please select a customer to view medical history.</div>;
  }

  if (isLoading) {
    return <div>Loading medical history...</div>; // Or a loading spinner
  }

  return (
    <div className="space-y-6">
      {medicalRecords.length === 0 && prescriptions.length === 0 ? (
        <div>No medical history found for this customer.</div>
      ) : (
        <>
          {/* Display Medical Records */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Medical Records</h3>
            {medicalRecords.map((record) => (
              <Card key={record.id} className="mb-4">
                <CardHeader>
                  <CardTitle>Record Date: {record.record_date}</CardTitle>
                   <div className="text-sm text-muted-foreground">Professional: {record.profiles?.full_name || 'N/A'}</div> {/* Display professional name */}
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Chief Complaint:</strong> {record.chief_complaint || '-'}</p>
                  <p><strong>Diagnosis:</strong> {record.diagnosis || '-'}</p>
                  <p><strong>Treatment Plan:</strong> {record.treatment_plan || '-'}</p>
                  <p><strong>Notes:</strong> {record.notes || '-'}</p>
                   {/* TODO: Link to related prescriptions */}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Display Prescriptions */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Prescriptions</h3>
            {prescriptions.map((prescription) => (
               <Card key={prescription.id} className="mb-4">
                <CardHeader>
                  <CardTitle>Prescription Date: {prescription.prescription_date}</CardTitle>
                   <div className="text-sm text-muted-foreground">Type: {prescription.type}</div>
                   <div className="text-sm text-muted-foreground">Prescriber: {prescription.profiles?.full_name || 'N/A'}</div> {/* Display prescriber name */}
                </CardHeader>
                <CardContent className="text-sm">
                   <p><strong>Notes:</strong> {prescription.notes || '-'}</p>
                   {/* Display OD/OS params */}
                   <div className="mt-2">
                       <h4 className="font-medium text-sm mb-1">OD (Right Eye) Params:</h4>
                       {prescription.od_params ? (
                           <div className="text-xs ml-2">
                               {prescription.type === 'glasses' ? (
                                   <>
                                       <p><strong>SPH:</strong> {prescription.od_params.sph ?? '-'}</p>
                                       <p><strong>CYL:</strong> {prescription.od_params.cyl ?? '-'}</p>
                                       <p><strong>Axis:</strong> {prescription.od_params.axis ?? '-'}</p>
                                       <p><strong>Add:</strong> {prescription.od_params.add ?? '-'}</p>
                                       <p><strong>Prism:</strong> {prescription.od_params.prism || '-'}</p>
                                   </>
                               ) : ( // contact_lens
                                   <>
                                       <p><strong>SPH:</strong> {prescription.od_params.sph ?? '-'}</p>
                                       <p><strong>CYL:</strong> {prescription.od_params.cyl ?? '-'}</p>
                                       <p><strong>Axis:</strong> {prescription.od_params.axis ?? '-'}</p>
                                       <p><strong>BC:</strong> {prescription.od_params.bc ?? '-'}</p>
                                       <p><strong>Dia:</strong> {prescription.od_params.dia ?? '-'}</p>
                                       <p><strong>Brand:</strong> {prescription.od_params.brand || '-'}</p>
                                   </>
                               )}
                           </div>
                       ) : (
                           <div className="text-xs ml-2">-</div>
                       )}
                   </div>

                    <div className="mt-2">
                       <h4 className="font-medium text-sm mb-1">OS (Left Eye) Params:</h4>
                       {prescription.os_params ? (
                           <div className="text-xs ml-2">
                               {prescription.type === 'glasses' ? (
                                   <>
                                       <p><strong>SPH:</strong> {prescription.os_params.sph ?? '-'}</p>
                                       <p><strong>CYL:</strong> {prescription.os_params.cyl ?? '-'}</p>
                                       <p><strong>Axis:</strong> {prescription.os_params.axis ?? '-'}</p>
                                       <p><strong>Add:</strong> {prescription.os_params.add ?? '-'}</p>
                                       <p><strong>Prism:</strong> {prescription.os_params.prism || '-'}</p>
                                   </>
                               ) : ( // contact_lens
                                   <>
                                       <p><strong>SPH:</strong> {prescription.os_params.sph ?? '-'}</p>
                                       <p><strong>CYL:</strong> {prescription.os_params.cyl ?? '-'}</p>
                                       <p><strong>Axis:</strong> {prescription.os_params.axis ?? '-'}</p>
                                       <p><strong>BC:</strong> {prescription.os_params.bc ?? '-'}</p>
                                       <p><strong>Dia:</strong> {prescription.os_params.dia ?? '-'}</p>
                                       <p><strong>Brand:</strong> {prescription.os_params.brand || '-'}</p>
                                   </>
                               )}
                           </div>
                       ) : (
                           <div className="text-xs ml-2">-</div>
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
