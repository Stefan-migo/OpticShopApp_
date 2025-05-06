"use client";

import * as React from "react"; // Import React
import { useEffect, useState } from "react"; // Import useEffect and useState
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
import { Separator } from "@/components/ui/separator"; // Assuming Separator component exists
import { format } from "date-fns"; // For date formatting
import { createClient } from "@/lib/supabase/client"; // Import createClient

import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface
import { useDictionary } from '@/lib/i18n/dictionary-context'; // Import useDictionary hook

interface PrescriptionDetailsDialogProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to format date strings nicely
const formatDisplayDate = (dateString: string | null | undefined, dictionary: Dictionary) => { // Add dictionary param
  if (!dateString) return dictionary.common.notAvailable; // Use dictionary
  try {
    // Add time part to avoid potential timezone interpretation issues by Date constructor
    // TODO: Localize date formatting based on locale and dictionary format string
    // Use dictionary for locale if available, otherwise default to en-US
    const locale = 'en-US'; // Placeholder for actual locale from dictionary or context
    return new Date(dateString + 'T00:00:00').toLocaleDateString(locale, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return dictionary.common.invalidDate; // Use dictionary
  }
};

// Helper to display parameter value or a placeholder
const pv = (value: any, dictionary: Dictionary) => value ?? dictionary.common.notAvailable; // Use dictionary for placeholder

export function PrescriptionDetailsDialog({
  prescription,
  isOpen,
  onOpenChange,
}: PrescriptionDetailsDialogProps) {
  const dictionary = useDictionary(); // Get dictionary from context
  // Removed supabase client and state/effect for fetching prescriber here
  // const supabase = createClient();
  // const [prescriberProfile, setPrescriberProfile] = useState<any>(null);
  // const [isLoadingPrescriber, setIsLoadingPrescriber] = useState(false);
  // Removed useEffect for fetching prescriber


  if (!prescription) return null; // Don't render if no prescription data

  // TODO: Localize customer name formatting
  const customerName = prescription.customers
    ? `${prescription.customers.last_name || ''}${prescription.customers.last_name && prescription.customers.first_name ? ', ' : ''}${prescription.customers.first_name || ''}`.trim() || dictionary.common.notAvailable // Use dictionary
    : dictionary.common.notAvailable; // Use dictionary

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

  // Access prescriber name from nested data
  const prescriberDisplayName = prescription.prescribers?.full_name || dictionary.common.notAvailable; // Use dictionary


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dictionary.prescriptions.detailsDialog.title}</DialogTitle> {/* Use dictionary */}
          <DialogDescription>
            {dictionary.prescriptions.detailsDialog.description} {customerName}. {/* Use dictionary */}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">{dictionary.prescriptions.detailsDialog.customerLabel}:</span> {/* Use dictionary */}
            <span className="col-span-2">{customerName}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">{dictionary.prescriptions.detailsDialog.typeLabel}:</span> {/* Use dictionary */}
            <span className="col-span-2">
              <Badge variant="secondary" className="capitalize">
                {/* TODO: Localize type text */}
                {prescription.type === 'contact_lens' ? dictionary.prescriptions.form.typeContactLens : dictionary.prescriptions.form.typeGlasses}
              </Badge>
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">{dictionary.prescriptions.detailsDialog.prescriptionDateLabel}:</span> {/* Use dictionary */}
            <span className="col-span-2">{formatDisplayDate(prescription.prescription_date, dictionary)}</span> {/* Use localized format and pass dictionary */}
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">{dictionary.prescriptions.detailsDialog.expiryDateLabel}:</span> {/* Use dictionary */}
            <span className="col-span-2">{formatDisplayDate(prescription.expiry_date, dictionary)}</span> {/* Use localized format and pass dictionary */}
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-muted-foreground">{dictionary.prescriptions.detailsDialog.prescriberLabel}:</span> {/* Use dictionary */}
            <span className="col-span-2">{prescriberDisplayName}</span> {/* Display fetched prescriber name */}
          </div>
          {/* Parameters Table */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">{dictionary.prescriptions.detailsDialog.parametersTitle}</h4>
            <div className="border rounded-md">
              <table className="w-full text-center">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.eyeHeader}</th><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.sphHeader}</th><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.cylHeader}</th><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.axisHeader}</th>{prescription.type === 'glasses' && (<><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.addHeader}</th><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.prismHeader}</th></>)}{prescription.type === 'contact_lens' && (<><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.bcHeader}</th><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.diaHeader}</th><th className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.brandHeader}</th></>)}</tr>
                </thead>
                <tbody>
                  <tr className="border-t"><td className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.odLabel}</td><td className="p-2">{pv(odParams.sph, dictionary)}</td><td className="p-2">{pv(odParams.cyl, dictionary)}</td><td className="p-2">{pv(odParams.axis, dictionary)}</td>{prescription.type === 'glasses' && (<><td className="p-2">{pv(odParams.add, dictionary)}</td><td className="p-2">{pv(odParams.prism, dictionary)}</td></>)}{prescription.type === 'contact_lens' && (<><td className="p-2">{pv(odParams.bc, dictionary)}</td><td className="p-2">{pv(odParams.dia, dictionary)}</td><td className="p-2">{pv(odParams.brand, dictionary)}</td></>)}</tr>
                  <tr className="border-t"><td className="p-2 font-medium">{dictionary.prescriptions.detailsDialog.osLabel}</td><td className="p-2">{pv(osParams.sph, dictionary)}</td><td className="p-2">{pv(osParams.cyl, dictionary)}</td><td className="p-2">{pv(osParams.axis, dictionary)}</td>{prescription.type === 'glasses' && (<><td className="p-2">{pv(osParams.add, dictionary)}</td><td className="p-2">{pv(osParams.prism, dictionary)}</td></>)}{prescription.type === 'contact_lens' && (<><td className="p-2">{pv(osParams.bc, dictionary)}</td><td className="p-2">{pv(osParams.dia, dictionary)}</td><td className="p-2">{pv(osParams.brand, dictionary)}</td></>)}</tr>
                </tbody>
              </table>
            </div>
          </div>
          {prescription.notes && (
            <div className="mt-4">
              <h4 className="font-medium mb-1">{dictionary.prescriptions.detailsDialog.notesTitle}</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{prescription.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{dictionary.common.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
