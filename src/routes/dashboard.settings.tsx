import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { pushNotification } from "@/hooks/use-notifications";

export const Route = createFileRoute("/dashboard/settings")({
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [preferredRole, setPreferredRole] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.full_name) setFullName(data.full_name);
            if (data.location) setLocation(data.location);
            if (data.preferred_role) setPreferredRole(data.preferred_role);
          }
          setLoading(false);
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        full_name: fullName,
        location: location,
        preferred_role: preferredRole,
      });
      
    if (!error) {
      pushNotification("Account settings updated successfully", "system");
    }
    setSaving(false);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>
      <Tabs defaultValue="account" className="glass rounded-2xl p-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notif">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Full name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" className="mt-1.5" /></div>
            <div><Label>Email</Label><Input disabled value={user?.email || ""} placeholder="Email" className="mt-1.5 bg-secondary/30" /></div>
            <div><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="mt-1.5" /></div>
            <div><Label>Preferred role</Label><Input value={preferredRole} onChange={e => setPreferredRole(e.target.value)} placeholder="Preferred role" className="mt-1.5" /></div>
          </div>
          <Button onClick={handleSave} disabled={saving || loading} className="gradient-brand text-white">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </TabsContent>
        <TabsContent value="password" className="mt-6 space-y-4 max-w-md">
          <div><Label>Current password</Label><Input type="password" className="mt-1.5" /></div>
          <div><Label>New password</Label><Input type="password" className="mt-1.5" /></div>
          <div><Label>Confirm new password</Label><Input type="password" className="mt-1.5" /></div>
          <Button className="gradient-brand text-white">Update password</Button>
        </TabsContent>
        <TabsContent value="notif" className="mt-6 space-y-4">
          {[
            ["Job matches", "Get pinged when a new ≥80% match appears"],
            ["Interview reminders", "24h and 1h before every interview"],
            ["Weekly digest", "Every Monday, in your inbox"],
            ["Product updates", "Occasional emails about new features"],
          ].map(([t, d]) => (
            <div key={t} className="flex items-center justify-between rounded-xl bg-secondary/40 p-4">
              <div><div className="font-medium">{t}</div><div className="text-sm text-muted-foreground">{d}</div></div>
              <Switch defaultChecked />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="theme" className="mt-6 space-y-3">
          <div className="text-sm text-muted-foreground">Use the moon/sun toggle in the top bar to switch themes. System settings coming soon.</div>
        </TabsContent>
        <TabsContent value="privacy" className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-4">
            <div><div className="font-medium">Show profile to recruiters</div><div className="text-sm text-muted-foreground">Verified employers can discover you</div></div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <Button variant="destructive">Delete account</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
