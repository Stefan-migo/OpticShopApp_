"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// Define a simple Zod schema with a nullable number
const testFormSchema = z.object({
  testNumber: z.coerce.number().optional().nullable(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export function TestNumberInputForm() {
  const { toast } = useToast();

  // Define form
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      testNumber: null, // Start with null
    },
  });

  // Watch the testNumber field to see its value change
  const watchedTestNumber = form.watch("testNumber");

  // Define submit handler
  function onSubmit(values: TestFormValues) {
    console.log("Test Form Submitted:", values);
    toast({
      title: "Test Form Submitted",
      description: `testNumber value: ${watchedTestNumber}`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Test Number Input</h3>
        <p>Watched value: {String(watchedTestNumber)}</p> {/* Display watched value */}

        <FormField
          control={form.control}
          name="testNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Number Input</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter a number"
                  {...field}
                  value={field.value ?? ''} // Handle null/undefined for display
                  // No custom onChange here, rely on {...field} and Zod coerce
                />
              </FormControl>
              <FormDescription>
                Enter a number and submit to see the value in the console. Clear the input to see if it becomes null.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit Test Form</Button>
      </form>
    </Form>
  );
}
