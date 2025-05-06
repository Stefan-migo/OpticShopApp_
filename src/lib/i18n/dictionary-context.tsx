"use client";

import { createContext, useContext } from 'react';
import { Dictionary } from './types';

// Create a context for the dictionary
const DictionaryContext = createContext<Dictionary | undefined>(undefined);

// Custom hook to access the dictionary context
export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    // This hook should only be used within components wrapped by the DictionaryProvider
    // In Next.js App Router, this provider would typically be in a Server Component layout
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
}

// Provider component (used in Server Components)
export const DictionaryProvider = ({ dictionary, children }: { dictionary: Dictionary; children: React.ReactNode }) => {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
};
