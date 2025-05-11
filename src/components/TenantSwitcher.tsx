'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import Cookies from 'js-cookie'; // Import js-cookie
import { createClient } from '@/lib/supabase/client'; // Import client-side Supabase client
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Tenant {
  id: string;
  name: string;
}

interface TenantSwitcherProps {
  isSuperuser: boolean; // Accept isSuperuser prop
}

export default function TenantSwitcher({ isSuperuser }: TenantSwitcherProps) { // Accept isSuperuser prop
  console.log('TenantSwitcher - Component rendered. isSuperuser prop:', isSuperuser); // Debugging log
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const supabase = createClient(); // Use client-side Supabase client

  useEffect(() => {
    async function fetchTenants() {
      if (!isSuperuser) { // Only fetch tenants if user is superuser (based on prop)
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('TenantSwitcher - User is superuser, attempting to fetch tenants from API...'); // Debugging log

      // Get the user's session to include the auth token in the request header
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
          console.error('TenantSwitcher - No access token found.'); // Debugging log
          setLoading(false);
          return;
      }

      // Fetch tenants from the new API route, including the auth token in headers
      const response = await fetch('/api/tenants', {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      console.log('TenantSwitcher - API response status:', response.status); // Debugging log
      if (response.ok) {
        const data = await response.json();
        console.log('TenantSwitcher - Fetched tenants data:', data); // Debugging log
        setTenants(data);
      } else {
        console.error('TenantSwitcher - Failed to fetch tenants:', response.statusText);
      }

      setLoading(false);
      console.log('TenantSwitcher - Loading set to false.'); // Debugging log
    }

    fetchTenants();
  }, [isSuperuser, supabase]); // Dependency on isSuperuser prop and supabase client

  // Effect to read selected tenant from cookie on initial load
  useEffect(() => {
    const storedTenantId = Cookies.get('selected_tenant_id'); // Use js-cookie
    setSelectedTenantId(storedTenantId || null);
  }, []);


  const handleTenantSelect = async (tenantId: string) => { // Make function async
    setSelectedTenantId(tenantId);
    // Store selected tenant ID in a cookie using js-cookie
    Cookies.set('selected_tenant_id', tenantId, { path: '/' });

    console.log(`TenantSwitcher - Navigating to ${pathname}?tenantId=${tenantId}`); // Log navigation
    // Navigate to the current path with the selected tenant ID as a search parameter
    router.push(`${pathname}?tenantId=${tenantId}`);

    // No need to call Server Action or refreshSession for this approach
    // The Server Component will read the search parameter
  };

  // Only render the switcher if the user is a superuser and there are tenants
  if (!isSuperuser || tenants.length === 0) {
      return null; // Or a message indicating no tenants available
  }

  if (loading) {
    return <div>Loading Tenants...</div>;
  }


  // Find the selected tenant name for display
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const displayTenantName = selectedTenant ? selectedTenant.name : 'Select Tenant';


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{displayTenantName}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem key={tenant.id} onClick={() => handleTenantSelect(tenant.id)}>
            {tenant.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
