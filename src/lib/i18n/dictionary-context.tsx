"use client";

import { createContext, useContext } from 'react';
import { Dictionary } from './types';

// Create a context for the dictionary
export const DictionaryContext = createContext<Dictionary | undefined>(undefined);

// Custom hook to access the dictionary context
export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    // This hook should only be used within components wrapped by the DictionaryProvider
    // In Next.js App Router, this provider would typically be in a Server Component layout
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  // Return a dictionary object with guaranteed nested structures, providing fallbacks
  return {
    ...context,
    customers: {
      ...context.customers,
      form: context.customers?.form || {}, // Provide empty object fallback for 'form'
      tableActions: context.customers?.tableActions || {}, // Provide fallback for 'tableActions'
    },
    inventory: {
      ...context.inventory,
      productDetailsDialog: context.inventory?.productDetailsDialog || {},
      stockColumns: context.inventory?.stockColumns || {},
      stockItemForm: context.inventory?.stockItemForm || {},
      productForm: context.inventory?.productForm || {},
    },
    prescriptions: {
      ...context.prescriptions,
      detailsDialog: context.prescriptions?.detailsDialog || {},
      form: context.prescriptions?.form || {}, // Provide empty object fallback for 'form'
      columns: context.prescriptions?.columns || {},
    },
    common: {
      ...context.common,
      status: context.common?.status || {},
    },
    medicalActions: {
      ...context.medicalActions,
      customerSelect: context.medicalActions?.customerSelect || {},
      history: context.medicalActions?.history || {},
      recordForm: context.medicalActions?.recordForm || {},
    },
    appointments: {
      ...context.appointments,
      form: context.appointments?.form || {}, // Provide empty object fallback for 'form'
    },
    sales: {
      ...context.sales,
      history: context.sales?.history || {},
    },
    userManagement: {
      ...context.userManagement,
      columns: context.userManagement?.columns || {},
    },
    loginPage: {
      ...context.loginPage,
      toast: context.loginPage?.toast || {},
    },
    settings: {
      ...context.settings,
      daysOfWeek: context.settings?.daysOfWeek || {},
    },
    // Add other top-level properties with nested objects as needed
  } as Dictionary; // Cast back to Dictionary type
}

// Provider component (used in Server Components)
export const DictionaryProvider = ({ dictionary, children }: { dictionary: Dictionary; children: React.ReactNode }) => {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
};
