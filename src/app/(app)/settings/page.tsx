import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxRateManager } from "./tax-rate-manager"; // Import the new component
import { Separator } from "@/components/ui/separator"; // Import Separator

// TODO: Research other common application settings (e.g., theme, notifications, defaults)

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage application preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Placeholder for other settings */}
           <div>
             <h3 className="text-lg font-medium mb-2">General</h3>
             <p className="text-sm text-muted-foreground">General application settings will go here (e.g., theme switcher).</p>
           </div>

           <Separator />

           {/* Tax Rate Management Section */}
           <TaxRateManager />

        </CardContent>
      </Card>
    </div>
  );
}
