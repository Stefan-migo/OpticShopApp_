import React from 'react';
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from 'next/headers'; // Import cookies helper
import { getDictionary } from '@/lib/i18n'; // Import getDictionary
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Added Table components
import { Badge } from "@/components/ui/badge"; // Added Badge for status
import { CustomerNotes } from "./customer-notes"; // Import the new component
import BackButton from "./back-button"; // Import the BackButton component
import { Dictionary } from '@/lib/i18n/types'; // Import Dictionary type
import { Locale } from '@/lib/i18n/config'; // Import Locale type from config
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/registry/new-york-v4/ui/breadcrumb"; // Import breadcrumb components
import Link from 'next/link'; // Import Link

export const dynamic = 'force-dynamic'; // Force dynamic rendering

type CustomerDetailPageProps = {
  params: { customerId: string, lang: Locale }; // Use Locale type for lang
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { lang, customerId } = await params; // Await and destructure params

  const dictionary = await getDictionary(lang); // Fetch dictionary using awaited lang
  const supabase = createServerComponentClient();

  // Read superuser and selected tenant cookies
  const cookieStore = await cookies();
  const isSuperuser = cookieStore.get('is_superuser')?.value === 'true';
  const selectedTenantId = cookieStore.get('selected_tenant_id')?.value;

  let query = supabase
    .from('customers')
    .select('*')
    .eq('id', customerId);

  // Apply tenant filter if superuser and a tenant is selected
  if (isSuperuser && selectedTenantId) {
    query = query.eq('tenant_id', selectedTenantId);
  }
  // Note: For non-superusers, RLS policies will automatically filter by their tenant_id

  const { data: customer, error } = await query.single();

  if (error || !customer) {
    console.error('Error fetching customer:', error);
    notFound(); // Or display an error message
  }

  return (
    <div className="container mx-auto py-0">
      <div className="flex flex-col ">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-6">{dictionary.customers.customerDetails?.title || 'Customer Details'}</h1>
          <BackButton dictionary={dictionary.customers.customerDetails} /> {/* Pass dictionary to BackButton */}
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || dictionary.customers.customerDetails?.title || 'Customer Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>{dictionary.customers.customerDetails?.emailLabel || 'Email'}:</strong> {customer.email || 'N/A'}</p>
          <p><strong>{dictionary.customers.customerDetails?.phoneLabel || 'Phone'}:</strong> {customer.phone || 'N/A'}</p>
          <p><strong>{dictionary.customers.customerDetails?.dobLabel || 'Date of Birth'}:</strong> {customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}</p>
          <div>
            <strong>{dictionary.customers.customerDetails?.addressLabel || 'Address'}:</strong>
            <div className="pl-4">
              <p>{customer.address_line1 || 'N/A'}</p>
              {customer.address_line2 && <p>{customer.address_line2}</p>}
              <p>
                {customer.city || ''}{customer.city && customer.state ? ', ' : ''}{customer.state || ''} {customer.postal_code || ''}
              </p>
              <p>{customer.country || ''}</p>
            </div>
          </div>
          <div>
            <strong>{dictionary.customers.customerDetails?.insuranceTitle || 'Insurance'}:</strong>
            <div className="pl-4">
              <p>{dictionary.customers.customerDetails?.insuranceProviderLabel || 'Provider'}: {customer.insurance_provider || 'N/A'}</p>
              <p>{dictionary.customers.customerDetails?.insurancePolicyNumberLabel || 'Policy #'}: {customer.insurance_policy_number || 'N/A'}</p>
            </div>
          </div>
          {customer.notes && (
            <div>
              <strong>{dictionary.customers.customerDetails?.notesLabel || 'Notes'}:</strong>
              <div className="pl-4">
                <p>{customer.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList>
          <TabsTrigger value="sales">{dictionary.customers.customerDetails?.pastSalesTitle || 'Past Sales'}</TabsTrigger>
          <TabsTrigger value="appointments">{dictionary.customers.customerDetails?.appointmentsTitle || 'Appointments'}</TabsTrigger>
          <TabsTrigger value="prescriptions">{dictionary.customers.customerDetails?.prescriptionsTitle || 'Prescriptions'}</TabsTrigger>
          <TabsTrigger value="notes">{dictionary.customers.customerDetails?.notesTitle || 'Notes'}</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.customers.customerDetails?.pastSalesTitle || 'Past Sales'}</CardTitle>
            </CardHeader>
            <CardContent>
              <PastSales customerId={customerId} isSuperuser={isSuperuser} selectedTenantId={selectedTenantId ?? null} dictionary={dictionary} /> {/* Pass full dictionary */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.customers.customerDetails?.appointmentsTitle || 'Appointments'}</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsHistory customerId={customerId} isSuperuser={isSuperuser} selectedTenantId={selectedTenantId ?? null} dictionary={dictionary} /> {/* Pass full dictionary */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.customers.customerDetails?.prescriptionsTitle || 'Prescriptions'}</CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionsHistory customerId={customerId} isSuperuser={isSuperuser} selectedTenantId={selectedTenantId ?? null} dictionary={dictionary} /> {/* Pass full dictionary */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.customers.customerDetails?.notesTitle || 'Notes'}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render the CustomerNotes component */}
              <CustomerNotes customerId={customerId} isSuperuser={isSuperuser} selectedTenantId={selectedTenantId ?? null} dictionary={dictionary.customers} /> {/* Pass dictionary.customers */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component to fetch and display past sales
async function PastSales({ customerId, isSuperuser, selectedTenantId, dictionary }: { customerId: string, isSuperuser: boolean, selectedTenantId: string | null, dictionary: Dictionary }): Promise<React.JSX.Element> {
  const supabase = createServerComponentClient();

  let query = supabase
    .from("sales_orders")
    .select("id, created_at, total_amount, status") // Select relevant fields
    .eq("customer_id", customerId);

  // Apply tenant filter if superuser and a tenant is selected
  if (isSuperuser && selectedTenantId) {
    query = query.eq('tenant_id', selectedTenantId);
  }

  const { data: sales, error } = await query
    .order("created_at", { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching past sales:", error);
    return <p className="text-red-500">{dictionary.customers.customerDetails?.error || 'Error loading sales history.'}</p>;
  }

  if (!sales || sales.length === 0) {
    return <p>{dictionary.customers.customerDetails?.noData || 'No sales history found for this customer.'}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dictionary.sales.history.orderNumberHeader || 'Order ID'}</TableHead>
          <TableHead>{dictionary.sales.history.dateHeader || 'Date'}</TableHead>
          <TableHead>{dictionary.sales.history.statusHeader || 'Status'}</TableHead>
          <TableHead className="text-right">{dictionary.sales.history.totalAmountHeader || 'Total'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">{sale.id.substring(0, 8)}...</TableCell> {/* Shorten ID */}
            <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
            <TableCell><Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>{sale.status}</Badge></TableCell>
            <TableCell className="text-right">${sale.total_amount?.toFixed(2) ?? '0.00'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Helper component to fetch and display appointments
async function AppointmentsHistory({ customerId, isSuperuser, selectedTenantId, dictionary }: { customerId: string, isSuperuser: boolean, selectedTenantId: string | null, dictionary: Dictionary }): Promise<React.JSX.Element> {
  const supabase = createServerComponentClient();

  let query = supabase
    .from("appointments")
    .select("id, appointment_time, type, status") // Select relevant fields
    .eq("customer_id", customerId);

  // Apply tenant filter if superuser and a tenant is selected
  if (isSuperuser && selectedTenantId) {
    query = query.eq('tenant_id', selectedTenantId);
  }

  const { data: appointments, error } = await query
    .order("appointment_time", { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching appointments:", error);
    return <p className="text-red-500">{dictionary.customers.customerDetails?.error || 'Error loading appointments.'}</p>;
  }

  if (!appointments || appointments.length === 0) {
    return <p>{dictionary.customers.customerDetails?.noData || 'No appointments found for this customer.'}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dictionary.appointments.form.dateTimeLabel || 'Date'}</TableHead>
          <TableHead>{dictionary.appointments.form.dateTimeLabel || 'Time'}</TableHead>
          <TableHead>{dictionary.appointments.form.typeLabel || 'Type'}</TableHead>
          <TableHead>{dictionary.common.statusHeader || 'Status'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appt) => (
          <TableRow key={appt.id}>
            <TableCell>{new Date(appt.appointment_time).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(appt.appointment_time).toLocaleTimeString()}</TableCell>
            <TableCell>{appt.type || 'N/A'}</TableCell>
            <TableCell><Badge variant={appt.status === 'scheduled' ? 'default' : 'secondary'}>{appt.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Define the structure for fetched prescription data with extracted JSONB fields
interface PrescriptionData {
  id: string;
  created_at: string;
  expiry_date: string | null;
  od_sphere: string | null;
  od_cylinder: string | null;
  od_add: string | null;
  os_sphere: string | null;
  os_cylinder: string | null;
  os_add: string | null;
}

// Helper component to fetch and display prescriptions
async function PrescriptionsHistory({ customerId, isSuperuser, selectedTenantId, dictionary }: { customerId: string, isSuperuser: boolean, selectedTenantId: string | null, dictionary: Dictionary }): Promise<React.JSX.Element> {
  const supabase = createServerComponentClient();
  // Select key fields for the summary table
  let query = supabase
    .from("prescriptions")
    .select("id, created_at, expiry_date, od_params->>'sphere' as od_sphere, od_params->>'cylinder' as od_cylinder, od_params->>'add' as od_add, os_params->>'sphere' as os_sphere, os_params->>'cylinder' as os_cylinder, os_params->>'add' as os_add")
    .eq("customer_id", customerId);

  // Apply tenant filter if superuser and a tenant is selected
  if (isSuperuser && selectedTenantId) {
    query = query.eq('tenant_id', selectedTenantId);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false }); // Show most recent first

  const prescriptions: PrescriptionData[] | null = data as PrescriptionData[] | null; // Explicitly type the data

  if (error) {
    console.error("Error fetching prescriptions:", error);
    return <p className="text-red-500">{dictionary.customers.customerDetails?.error || 'Error loading prescriptions.'}</p>;
  }

  if (!prescriptions || prescriptions.length === 0) {
    return <p>{dictionary.customers.customerDetails?.noData || 'No prescriptions found for this customer.'}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dictionary.prescriptions.columns.prescriptionDateHeader || 'Issued Date'}</TableHead>
          <TableHead>{dictionary.prescriptions.columns.expiryDateHeader || 'Expiry Date'}</TableHead>
          <TableHead>{dictionary.prescriptions.form.paramLabels.sphLabel || 'OD Sphere'}</TableHead>
          <TableHead>{dictionary.prescriptions.form.paramLabels.cylLabel || 'OD Cylinder'}</TableHead>
          <TableHead>{dictionary.prescriptions.form.paramLabels.addLabel || 'OD Add'}</TableHead>
          <TableHead>{dictionary.prescriptions.form.paramLabels.sphLabel || 'OS Sphere'}</TableHead>
          <TableHead>{dictionary.prescriptions.form.paramLabels.cylLabel || 'OS Cylinder'}</TableHead>
          <TableHead>{dictionary.prescriptions.form.paramLabels.addLabel || 'OS Add'}</TableHead>
          {/* TODO: Add action button to view full prescription details */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {prescriptions.map((rx: PrescriptionData) => ( // Explicitly type rx
          <TableRow key={rx.id}>
            <TableCell>{new Date(rx.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{rx.expiry_date ? new Date(rx.expiry_date).toLocaleDateString() : 'N/A'}</TableCell>
            <TableCell>{rx.od_sphere ?? 'N/A'}</TableCell>
            <TableCell>{rx.od_cylinder ?? 'N/A'}</TableCell>
            <TableCell>{rx.od_add ?? 'N/A'}</TableCell>
            <TableCell>{rx.os_sphere ?? 'N/A'}</TableCell>
            <TableCell>{rx.os_cylinder ?? 'N/A'}</TableCell>
            <TableCell>{rx.os_add ?? 'N/A'}</TableCell>
            {/* TODO: Add action button to view full prescription details */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
