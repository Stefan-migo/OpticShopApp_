'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import { supabase } from "@/lib/supabase/client-helpers"; // Import the single client instance

interface BreadcrumbDetailNameProps {
  id: string;
  type: 'customer' | 'product';
  isSuperuser: boolean;
  userTenantId: string | null;
}

const BreadcrumbDetailName: React.FC<BreadcrumbDetailNameProps> = ({ id, type, isSuperuser, userTenantId }) => {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // const supabase = createClientComponentClient(); // Remove client creation here
  const pathname = usePathname(); // Get pathname here to trigger effect on route change

  useEffect(() => {
    const fetchName = async () => {
      setLoading(true);
      let query;
      if (type === 'customer') {
        query = supabase
          .from('customers')
          .select('first_name, last_name')
          .eq('id', id);
      } else { // type === 'product'
        query = supabase
          .from('products')
          .select('name')
          .eq('id', id);
      }

      // Apply tenant filter if superuser and a tenant is selected
      if (isSuperuser && userTenantId) {
        query = query.eq('tenant_id', userTenantId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error(`Error fetching ${type} name for breadcrumb:`, error);
        setName(id); // Fallback to ID on error
      } else if (data) {
        if (type === 'customer') {
          setName(`${(data as any).first_name || ''} ${(data as any).last_name || ''}`.trim() || id); // Use type assertion and fallback to ID
        } else { // type === 'product'
          setName((data as any).name || id); // Use type assertion and fallback to ID
        }
      } else {
        setName(id); // Fallback to ID if no data found
      }
      setLoading(false);
    };

    fetchName();
  }, [id, type, supabase, isSuperuser, userTenantId, pathname]); // Add pathname to dependencies

  if (loading) {
    return <span>Loading...</span>;
  }

  return <span>{name}</span>;
};

export default BreadcrumbDetailName;
