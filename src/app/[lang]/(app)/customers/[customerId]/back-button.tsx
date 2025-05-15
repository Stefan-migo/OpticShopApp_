'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dictionary } from '@/lib/i18n/types'; // Import Dictionary type

interface BackButtonProps {
  dictionary?: Dictionary['customers']['customerDetails'];
}

export default function BackButton({ dictionary }: BackButtonProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end mb-6"> {/* Container for positioning */}
      <Button variant="default" onClick={() => router.back()}> {/* Changed variant to default */}
        {dictionary?.returnButton || 'Back to Customers'} {/* Use translated text */}
      </Button>
    </div>
  );
}
