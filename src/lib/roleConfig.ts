import { Dictionary } from '@/lib/i18n/types'; // Import shared Dictionary interface

export const getRoleDisplayNames = (dictionary: Dictionary | null | undefined): Record<string, string> => {
  if (!dictionary || !dictionary.roles) {
    // Fallback to default English names if dictionary or roles are not available
    return {
      admin: 'Admin',
      professional: 'Professional',
      staff: 'Staff',
    };
  }

  return {
    admin: dictionary.roles.admin || 'Admin',
    professional: dictionary.roles.professional || 'Professional',
    staff: dictionary.roles.staff || 'Staff',
  };
};
