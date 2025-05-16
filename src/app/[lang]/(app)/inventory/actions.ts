"use server";

import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { cookies } from "next/headers";
import { type Supplier } from "@/lib/supabase/types/database.types"; // Assuming types are generated

// Helper function to get the current user's tenant_id
async function getUserTenantId() {
  const supabase = createServerComponentClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Error fetching user:", error?.message);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError?.message);
    return null;
  }

  return profile.tenant_id;
}

export async function getSuppliers() {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { data: null, error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('tenant_id', tenantId); // Filter by tenant_id

  if (error) {
    console.error("Error fetching suppliers:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getCategories() {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { data: null, error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('tenant_id', tenantId); // Filter by tenant_id

  if (error) {
    console.error("Error fetching product categories:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

interface AddSupplierParams {
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export async function addSupplier(params: AddSupplierParams) {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { data: null, error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      ...params,
      tenant_id: tenantId, // Include tenant_id
    })
    .select() // Select the inserted data
    .single(); // Expect a single result

  if (error) {
    console.error("Error adding supplier:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

interface AddProductCategoryParams {
  name: string;
}

export async function addProductCategory(params: AddProductCategoryParams) {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { data: null, error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('product_categories')
    .insert({
      ...params,
      tenant_id: tenantId, // Include tenant_id
    })
    .select() // Select the inserted data
    .single(); // Expect a single result

  if (error) {
    console.error("Error adding product category:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

interface UpdateProductCategoryParams extends AddProductCategoryParams {} // Define update params

export async function updateProductCategory(id: string, params: UpdateProductCategoryParams): Promise<{ data: any | null; error: any }> { // TODO: Define Category type
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { data: null, error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('product_categories')
    .update({
      ...params,
      tenant_id: tenantId, // Include tenant_id
    })
    .eq('id', id) // Filter by category ID
    .eq('tenant_id', tenantId) // Filter by tenant_id
    .select() // Select the updated data
    .single(); // Expect a single result

  if (error) {
    console.error("Error updating product category:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteProductCategory(id: string): Promise<{ error: any }> {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id) // Filter by category ID
    .eq('tenant_id', tenantId); // Filter by tenant_id

  if (error) {
    console.error("Error deleting product category:", error.message);
    return { error };
  }

  return { error: null };
}

interface UpdateSupplierParams extends AddSupplierParams {} // Define update params

export async function updateSupplier(id: string, params: UpdateSupplierParams): Promise<{ data: Supplier | null; error: any }> {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { data: null, error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { data, error } = await supabase
    .from('suppliers')
    .update({
      ...params,
      tenant_id: tenantId, // Include tenant_id
    })
    .eq('id', id) // Filter by supplier ID
    .eq('tenant_id', tenantId) // Filter by tenant_id
    .select() // Select the updated data
    .single(); // Expect a single result

  if (error) {
    console.error("Error updating supplier:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteSupplier(id: string): Promise<{ error: any }> {
  const tenantId = await getUserTenantId();

  if (!tenantId) {
    return { error: new Error("Tenant ID not found.") };
  }

  const supabase = createServerComponentClient();
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id) // Filter by supplier ID
    .eq('tenant_id', tenantId); // Filter by tenant_id

  if (error) {
    console.error("Error deleting supplier:", error.message);
    return { error };
  }

  return { error: null };
}
