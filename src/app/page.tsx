import { redirect } from 'next/navigation';
import { i18n } from '@/lib/i18n/config';

export default function RootPage() {
  // Redirect to the default locale's landing page.
  // The middleware should handle redirecting to the user's preferred locale if different.
  redirect(`/${i18n.defaultLocale}/landing`);
}
