import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// TODO: Research common application settings (e.g., theme, notifications, defaults)
// TODO: Implement forms for updating settings

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage application preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings options coming soon...</p>
          {/* Add settings sections/forms here */}
        </CardContent>
      </Card>
    </div>
  );
}
