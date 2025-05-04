import React from 'react';
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type CustomerDetailPageProps = {
  params: { customerId: string };
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const supabase = createServerComponentClient();
  const { customerId } = params;

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error || !customer) {
    console.error('Error fetching customer:', error);
    notFound(); // Or display an error message
  }

  return (
    <div className="container mx-auto py-10">
      <BackButton /> {/* Add the BackButton component */}
      <h1 className="text-3xl font-bold mb-6">Customer Details</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> {customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}</p>
          <div>
            <strong>Address:</strong>
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
            <strong>Insurance:</strong>
            <div className="pl-4">
                 <p>Provider: {customer.insurance_provider || 'N/A'}</p>
                 <p>Policy #: {customer.insurance_policy_number || 'N/A'}</p>
            </div>
          </div>
          {customer.notes && (
            <div>
              <strong>Notes:</strong>
              <div className="pl-4">
                <p>{customer.notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList>
          <TabsTrigger value="sales">Past Sales</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Past Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <PastSales customerId={customerId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsHistory customerId={customerId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionsHistory customerId={customerId} />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render the CustomerNotes component */}
              <CustomerNotes customerId={customerId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component to fetch and display past sales
async function PastSales({ customerId }: { customerId: string }): Promise<JSX.Element> {
  const supabase = createServerComponentClient();
  const { data: sales, error } = await supabase
    .from("sales_orders")
    .select("id, created_at, total_amount, status") // Select relevant fields
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching past sales:", error);
    return <p className="text-red-500">Error loading sales history.</p>;
  }

  if (!sales || sales.length === 0) {
    return <p>No sales history found for this customer.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
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
async function AppointmentsHistory({ customerId }: { customerId: string }): Promise<JSX.Element> {
  const supabase = createServerComponentClient();
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, appointment_time, type, status") // Select relevant fields
    .eq("customer_id", customerId)
    .order("appointment_time", { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching appointments:", error);
    return <p className="text-red-500">Error loading appointments.</p>;
  }

  if (!appointments || appointments.length === 0) {
    return <p>No appointments found for this customer.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
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

// Helper component to fetch and display prescriptions
async function PrescriptionsHistory({ customerId }: { customerId: string }): Promise<JSX.Element> {
  const supabase = createServerComponentClient();
  // Select key fields for the summary table
  const { data: prescriptions, error } = await supabase
    .from("prescriptions")
    .select("id, created_at, expiry_date, od_params->>'sphere' as od_sphere, od_params->>'cylinder' as od_cylinder, od_params->>'add' as od_add, os_params->>'sphere' as os_sphere, os_params->>'cylinder' as os_cylinder, os_params->>'add' as os_add")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching prescriptions:", error);
    return <p className="text-red-500">Error loading prescriptions.</p>;
  }

  if (!prescriptions || prescriptions.length === 0) {
    return <p>No prescriptions found for this customer.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Issued Date</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>OD Sphere</TableHead>
          <TableHead>OD Cylinder</TableHead>
          <TableHead>OD Add</TableHead>
          <TableHead>OS Sphere</TableHead>
          <TableHead>OS Cylinder</TableHead>
          <TableHead>OS Add</TableHead>
          {/* TODO: Add action button to view full prescription details */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {prescriptions.map((rx) => (
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
