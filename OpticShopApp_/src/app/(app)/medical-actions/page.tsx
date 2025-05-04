"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // Assuming client-side check for simplicity
import { CustomerSelect } from '@/components/CustomerSelect'; // Import CustomerSelect component
import { MedicalHistoryDisplay } from '@/components/medical-actions/MedicalHistoryDisplay'; // Import MedicalHistoryDisplay component
import { MedicalRecordForm } from '@/components/medical-actions/MedicalRecordForm'; // Import MedicalRecordForm component
import { Button } from '@/components/ui/button'; // Import Button component
import { PrescriptionForm } from '../prescriptions/prescription-form'; // Import PrescriptionForm component

export default function MedicalActionsPage() {
  const [userRole, setUserRole] = useState < string | null > (null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false); // State to toggle add record form visibility
  const [showAddPrescriptionForm, setShowAddPrescriptionForm] = useState(false); // State to toggle add prescription form visibility
  const [selectedCustomerId, setSelectedCustomerId] = useState < string | null > (null); // State for selected customer ID
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      setIsLoading(true);
      // TODO: Implement logic to get the current user's role
      // This might involve fetching the user from Supabase auth and then their profile from the 'profiles' table
      // For now, simulating a check:
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        // Assuming role is stored in the profiles table and linked by user.id
        const {
          data: profile,
          error
        } = await supabase
          .from('profiles')
          .select('role_id') // Assuming role_id links to the roles table
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }

        if (profile ? .role_id) {
          // Fetch role name from roles table
          const {
            data: roleData,
            error: roleError
          } = await supabase
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();

          if (roleError) {
            console.error("Error fetching role name:", roleError);
            setIsLoading(false);
            return;
          }
          setUserRole(roleData ? .name || null);

        } else {
          setUserRole(null); // No role found
        }

      } else {
        setUserRole(null); // No user
      }
      setIsLoading(false);
    };

    checkRole();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // Check if user has 'admin' or 'professional' role
  const isAuthorized = userRole === 'admin' || userRole === 'professional';

  if (!isAuthorized) {
    // Redirect or show access denied message
    router.push('/unauthorized'); // Assuming an unauthorized page exists
    return null; // Or return an access denied component
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Medical Actions</h1>
      {/* Customer Search/Selection Component */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Customer</h2>
        <CustomerSelect onCustomerSelect={setSelectedCustomerId} /> {/* Integrate CustomerSelect */}
      </div>

      {/* Medical History Display */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Medical History</h2>
        <MedicalHistoryDisplay customerId={selectedCustomerId} /> {/* Integrate MedicalHistoryDisplay */}
      </div>

      {/* Medical Record Form (Add/Edit) */}
      {showAddRecordForm && selectedCustomerId && ( // Only show form if toggled and customer is selected
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Add New Medical Record</h3>
          <MedicalRecordForm
            customerId={selectedCustomerId}
            onSuccess={() => {
              // TODO: Refresh medical history display after successful add/edit
              setShowAddRecordForm(false); // Hide form after success
            }}
          />
        </div>
      )}

      {/* Add Medical Record and Prescription Buttons */}
      {selectedCustomerId && ( // Only show buttons if a customer is selected
        <div className="mt-6 flex gap-4"> {/* Use flex and gap for spacing */}
          <Button onClick={() => setShowAddRecordForm(!showAddRecordForm)}>
            {showAddRecordForm ? 'Cancel Add Record' : 'Add New Medical Record'}
          </Button>
          <Button onClick={() => setShowAddPrescriptionForm(!showAddPrescriptionForm)}> {/* New button */}
            {showAddPrescriptionForm ? 'Cancel Add Prescription' : 'Add New Prescription'}
          </Button>
        </div>
      )}

      {/* Prescription Form (Add/Edit) */}
      {showAddPrescriptionForm && selectedCustomerId && ( // Only show form if toggled and customer is selected
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-4">Add New Prescription</h3>
          <PrescriptionForm
            customerId={selectedCustomerId} // Pass the selected customer ID
            onSuccess={() => {
              // TODO: Refresh relevant display after successful add/edit (e.g., medical history if it shows prescriptions)
              setShowAddPrescriptionForm(false); // Hide form after success
            }}
          />
        </div>
      )}

    </div>
  );
}