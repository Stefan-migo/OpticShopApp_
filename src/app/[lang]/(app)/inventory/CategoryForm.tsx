"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from 'react'; // Import useEffect
import { useToast } from "@/components/ui/use-toast";
import { type Dictionary } from "@/lib/i18n/types";
import { addProductCategory, updateProductCategory } from "./actions"; // Import add and update actions
// TODO: Define Category type in database.types.ts and import it
// import { type Category } from "@/lib/supabase/types/database.types";

interface CategoryFormProps {
  dictionary: Dictionary;
  initialData?: any | null; // Use any for now, TODO: Use Category type
  onCategoryAdded?: () => void; // Callback for adding
  onCategoryUpdated?: () => void; // Callback for updating
  onCancelEdit?: () => void; // Callback for canceling edit
}

export function CategoryForm({ dictionary, initialData, onCategoryAdded, onCategoryUpdated, onCancelEdit }: CategoryFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;

  const categoryFormSchema = z.object({
    name: z.string().min(1, { message: dictionary.inventory.categoryForm?.nameRequired }),
  });

  type CategoryFormValues = z.infer<typeof categoryFormSchema>;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [initialData, form]);

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: CategoryFormValues) {
    if (isEditing && initialData) {
      // Update existing category
      const { data, error } = await updateProductCategory(initialData.id, values); // Call update action

      if (error) {
        toast({
          title: dictionary.inventory.categoryForm?.saveErrorTitle,
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        toast({
          title: dictionary.inventory.categoryForm?.saveSuccess,
          variant: "default",
        });
        onCategoryUpdated?.(); // Notify parent component
      }
    } else {
      // Add new category
      const { data, error } = await addProductCategory(values); // Call add action

      if (error) {
        toast({
          title: dictionary.inventory.categoryForm?.saveErrorTitle,
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        toast({
          title: dictionary.inventory.categoryForm?.saveSuccess,
          variant: "default",
        });
        onCategoryAdded?.(); // Notify parent component
        form.reset(); // Reset the form
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.inventory.categoryForm?.nameLabel || "Category Name"} *</FormLabel>
                <Input placeholder={dictionary.inventory.categoryForm?.namePlaceholder || "Category Name"} {...field} disabled={isLoading} /> {/* Disable while loading */}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-2"> {/* Add container for buttons */}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? (isEditing ? dictionary.common?.saving : dictionary.common?.adding) // Use common saving/adding keys
              : (isEditing ? dictionary.inventory.categoryForm?.saveChangesButton : dictionary.inventory.categoryForm?.addButton)
            }
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>
              {dictionary.common?.cancel || "Cancel"} {/* Use common cancel key */}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
