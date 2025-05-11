"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation'; // Import useParams and useSearchParams
import { createClient } from '@/lib/supabase/client'; // Assuming client-side check for simplicity
import { CustomerSelect } from '@/components/CustomerSelect'; // Import CustomerSelect component
import { MedicalHistoryDisplay } from '@/components/medical-actions/MedicalHistoryDisplay'; // Import MedicalHistoryDisplay component
import { MedicalRecordForm } from '@/components/medical-actions/MedicalRecordForm'; // Import MedicalRecordForm component
import { Button } from '@/components/ui/button'; // Import Button component
import { PrescriptionForm } from '../prescriptions/prescription-form'; // Import PrescriptionForm component
import { getDictionary } from '@/lib/i18n'; // Import getDictionary
import { Locale } from '@/lib/i18n/config'; // Import Locale
import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface


export default function MedicalActionsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSuperuser, setIsSuperuser] = useState(false); // State for isSuperuser flag
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false); // State to toggle add record form visibility
  const [showAddPrescriptionForm, setShowAddPrescriptionForm] = useState(false); // State to toggle add prescription form visibility
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null); // State for selected customer ID
  const supabase = createClient();
  const router = useRouter();
  const params = useParams(); // Get params from URL
  const lang = params.lang as Locale; // Extract locale
  const searchParams = useSearchParams(); // Get search parameters
  const tenantId = searchParams.get('tenantId'); // Get tenantId from search parameters


  // Fetch dictionary
  const [dictionary, setDictionary] = useState<Dictionary | null>(null); // Use Dictionary interface
  useEffect(() => {
    const fetchDictionary = async () => {
      const dict = await getDictionary(lang);
      setDictionary(dict);
    };
    fetchDictionary();
  }, [lang]); // Refetch dictionary if locale changes


  useEffect(() => {
    const checkRoleAndSuperuser = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role_id, is_superuser') // Select both role_id and is_superuser
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }

        if (profile) {
            setIsSuperuser(profile.is_superuser ?? false); // Set isSuperuser state
             if (profile.role_id) {
                const { data: roleData, error: roleError } = await supabase
                    .from('roles')
                    .select('name')
                    .eq('id', profile.role_id)
                    .single();

                if (roleError) {
                    console.error("Error fetching role name:", roleError);
                     setIsLoading(false);
                     return;
                }
                setUserRole(roleData?.name || null);

            } else {
                 setUserRole(null); // No role found
            }
        } else {
             setUserRole(null); // No profile found
             setIsSuperuser(false); // No profile, not superuser
        }

      } else {
        setUserRole(null); // No user
        setIsSuperuser(false); // No user, not superuser
      }
      setIsLoading(false);
    };

    checkRoleAndSuperuser();
  }, [supabase]);

  if (isLoading || !dictionary) { // Wait for dictionary to load
    return <div>{dictionary?.common?.loading || "Loading..."}</div>; // Use dictionary
  }

  // Check if user has 'admin' or 'professional' role OR is superuser
  const isAuthorized = userRole === 'admin' || userRole === 'professional' || isSuperuser;


  if (!isAuthorized) {
    // Redirect or show access denied message
    router.push(`/${lang}/unauthorized`); // Redirect with locale
    return null; // Or return an access denied component
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{dictionary.medicalActions.title || "Medical Actions"}</h1> {/* Use dictionary */}
      {/* Customer Search/Selection Component */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{dictionary.medicalActions.selectCustomerTitle || "Select Customer"}</h2> {/* Use dictionary */}
        {/* Pass isSuperuser and tenantId to CustomerSelect if it needs them for filtering */}
        <CustomerSelect onCustomerSelect={setSelectedCustomerId} isSuperuser={isSuperuser} tenantId={tenantId} /> {/* Integrate CustomerSelect, Pass dictionary, isSuperuser, tenantId */}
      </div>

      {/* Medical History Display */}
       <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{dictionary.medicalActions.medicalHistoryTitle || "Medical History"}</h2> {/* Use dictionary */}
        {/* Pass isSuperuser and tenantId to MedicalHistoryDisplay */}
        <MedicalHistoryDisplay customerId={selectedCustomerId} isSuperuser={isSuperuser} tenantId={tenantId} /> {/* Integrate MedicalHistoryDisplay, Pass dictionary, isSuperuser, tenantId */}
      </div>

      {/* Medical Record Form (Add/Edit) */}
      {showAddRecordForm && selectedCustomerId && ( // Only show form if toggled and customer is selected
        <div className="mt-6 p-4 border rounded-md">
           <h3 className="text-lg font-semibold mb-4">{dictionary.medicalActions.addRecordTitle || "Add New Medical Record"}</h3> {/* Use dictionary */}
           <MedicalRecordForm
              customerId={selectedCustomerId}
              onSuccess={() => {
                // TODO: Refresh medical history display after successful add/edit
                setShowAddRecordForm(false); // Hide form after success
              }}
              dictionary={dictionary} // Pass dictionary
              // Pass isSuperuser and tenantId to MedicalRecordForm if needed for insertion
              isSuperuser={isSuperuser}
              tenantId={tenantId}
           />
        </div>
      )}

      {/* Add Medical Record and Prescription Buttons */}
      {selectedCustomerId && ( // Only show buttons if a customer is selected
        <div className="mt-6 flex gap-4"> {/* Use flex and gap for spacing */}
          <Button onClick={() => setShowAddRecordForm(!showAddRecordForm)}>
            {showAddRecordForm ? (dictionary.medicalActions.cancelAddRecordButton || 'Cancel Add Record') : (dictionary.medicalActions.addRecordButton || 'Add New Medical Record')} {/* Use dictionary */}
          </Button>
          <Button onClick={() => setShowAddPrescriptionForm(!setShowAddPrescriptionForm)}> {/* New button */}
            {showAddPrescriptionForm ? (dictionary.medicalActions.cancelAddPrescriptionButton || 'Cancel Add Prescription') : (dictionary.medicalActions.addPrescriptionButton || 'Add New Prescription')} {/* Use dictionary */}
          </Button>
        </div>
      )}

      {/* Prescription Form (Add/Edit) */}
      {showAddPrescriptionForm && selectedCustomerId && ( // Only show form if toggled and customer is selected
        <div className="mt-6 p-4 border rounded-md">
           <h3 className="text-lg font-semibold mb-4">{dictionary.medicalActions.addPrescriptionTitle || "Add New Prescription"}</h3> {/* Use dictionary */}
           <PrescriptionForm
              customerId={selectedCustomerId} // Pass the selected customer ID
              onSuccess={() => {
                // TODO: Refresh relevant display after successful add/edit (e.g., medical history if it shows prescriptions)
                setShowAddPrescriptionForm(false); // Hide form after success
              }}
              dictionary={dictionary} // Pass dictionary
               // Pass isSuperuser and tenantId to PrescriptionForm if needed for insertion
              isSuperuser={isSuperuser}
              tenantId={tenantId}
           />
        </div>
      )}

    </div>
  );
}
