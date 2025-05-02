import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, // Optional footer
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // For close button
import { Badge } from "@/components/ui/badge";
import { type Prescription } from "./columns"; // Import Prescription type

interface PrescriptionDetailsDialogProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to format date strings nicely
const formatDisplayDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    // Add time part to avoid potential timezone interpretation issues by Date constructor
    return new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper to display parameter value or a placeholder
const pv = (value: any) => value ?? '-';

export function PrescriptionDetailsDialog({
  prescription,
  isOpen,
  onOpenChange,
}: PrescriptionDetailsDialogProps) {
  if (!prescription) return null; // Don't render if no prescription data

  const customerName = prescription.customers
    ? `${prescription.customers.last_name || ''}${prescription.customers.last_name && prescription.customers.first_name ? ', ' : ''}${prescription.customers.first_name || ''}`.trim() || 'N/A'
    : 'N/A';

  // Safely parse JSONB parameters
  let odParams: any = {};
  let osParams: any = {};
  try {
    odParams = prescription.od_params ? (typeof prescription.od_params === 'string' ? JSON.parse(prescription.od_params) : prescription.od_params) : {};
    osParams = prescription.os_params ? (typeof prescription.os_params === 'string' ? JSON.parse(prescription.os_params) : prescription.os_params) : {};
  } catch (e) {
    console.error("Error parsing prescription params:", e);
    // Keep params as empty objects if parsing fails
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prescription Details</DialogTitle>
          <DialogDescription>
            Viewing prescription for {customerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">Customer:</span>
            <span className="col-span-2">{customerName}</span>
          </div>
           <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">Type:</span>
            <span className="col-span-2">
                <Badge variant="secondary" className="capitalize">
                    {prescription.type === 'contact_lens' ? 'Contact Lenses' : 'Glasses'}
                </Badge>
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">Prescription Date:</span>
            <span className="col-span-2">{formatDisplayDate(prescription.prescription_date)}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">Expiry Date:</span>
            <span className="col-span-2">{formatDisplayDate(prescription.expiry_date)}</span>
          </div>
           <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">Prescriber:</span>
            <span className="col-span-2">{prescription.prescriber_name || 'N/A'}</span>
          </div>

          {/* Parameters Table */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Parameters</h4>
            <div className="border rounded-md">
              <table className="w-full text-center">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-2 font-medium">Eye</th>
                    <th className="p-2 font-medium">SPH</th>
                    <th className="p-2 font-medium">CYL</th>
                    <th className="p-2 font-medium">Axis</th>
                    {prescription.type === 'glasses' && (
                      <>
                        <th className="p-2 font-medium">Add</th>
                        <th className="p-2 font-medium">Prism</th>
                      </>
                    )}
                    {prescription.type === 'contact_lens' && (
                      <>
                        <th className="p-2 font-medium">BC</th>
                        <th className="p-2 font-medium">Dia</th>
                        <th className="p-2 font-medium">Brand</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2 font-medium">OD (Right)</td>
                    <td className="p-2">{pv(odParams.sph)}</td>
                    <td className="p-2">{pv(odParams.cyl)}</td>
                    <td className="p-2">{pv(odParams.axis)}</td>
                    {prescription.type === 'glasses' && (
                      <>
                        <td className="p-2">{pv(odParams.add)}</td>
                        <td className="p-2">{pv(odParams.prism)}</td>
                      </>
                    )}
                     {prescription.type === 'contact_lens' && (
                      <>
                        <td className="p-2">{pv(odParams.bc)}</td>
                        <td className="p-2">{pv(odParams.dia)}</td>
                        <td className="p-2">{pv(odParams.brand)}</td>
                      </>
                    )}
                  </tr>
                  <tr className="border-t">
                    <td className="p-2 font-medium">OS (Left)</td>
                    <td className="p-2">{pv(osParams.sph)}</td>
                    <td className="p-2">{pv(osParams.cyl)}</td>
                    <td className="p-2">{pv(osParams.axis)}</td>
                     {prescription.type === 'glasses' && (
                      <>
                        <td className="p-2">{pv(osParams.add)}</td>
                        <td className="p-2">{pv(osParams.prism)}</td>
                      </>
                    )}
                     {prescription.type === 'contact_lens' && (
                      <>
                        <td className="p-2">{pv(osParams.bc)}</td>
                        <td className="p-2">{pv(osParams.dia)}</td>
                        <td className="p-2">{pv(osParams.brand)}</td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {prescription.notes && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">Notes</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{prescription.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
