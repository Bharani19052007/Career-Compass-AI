import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Upload, Briefcase, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Welcome — CareerPilot AI" }],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { preferences, updatePreferences, completeOnboarding } = useOnboarding();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth(true); // require auth for onboarding

  const handleNext = async () => {
    if (step === 1) {
      if (!preferences.areaOfInterest || !preferences.preferredJob) return;
      
      // Save initial profile to Supabase
      if (user) {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          preferred_role: preferences.preferredJob,
          location: preferences.preferredLocation || 'Not specified',
          full_name: user.user_metadata?.full_name || 'User',
          headline: 'Job Seeker'
        });
      }
      
      setStep(2);
    } else {
      completeOnboarding();
      navigate({ to: "/dashboard" });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updatePreferences({ resumeUploaded: true });
      setTimeout(() => {
        completeOnboarding();
        navigate({ to: "/dashboard" });
      }, 1000);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: "4s" }} />
      
      <div className="w-full max-w-lg z-10">
        <div className="mb-10 text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand shadow-glow mb-6">
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl font-bold tracking-tight">Welcome to CareerPilot</motion.h1>
          <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground mt-3 text-lg">Let's set up your profile for AI matching.</motion.p>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-strong rounded-[2rem] p-10 relative overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Career Preferences</h2>
                  <p className="text-sm text-muted-foreground mb-6">What kind of roles are you looking for?</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Area of Interest</Label>
                    <Select 
                      value={preferences.areaOfInterest} 
                      onValueChange={(val) => updatePreferences({ areaOfInterest: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an area..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Data Science">Data Science & AI</SelectItem>
                        <SelectItem value="Product Design">Product Design (UI/UX)</SelectItem>
                        <SelectItem value="Product Management">Product Management</SelectItem>
                        <SelectItem value="Marketing">Marketing & Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job">Preferred Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="job" 
                        placeholder="e.g. Frontend Engineer" 
                        className="pl-9"
                        value={preferences.preferredJob}
                        onChange={(e) => updatePreferences({ preferredJob: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Preferred Location (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="location" 
                        placeholder="e.g. Remote, Bangalore, New York" 
                        className="pl-9"
                        value={preferences.preferredLocation}
                        onChange={(e) => updatePreferences({ preferredLocation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full gradient-brand text-white mt-8 shadow-glow" 
                  onClick={handleNext}
                  disabled={!preferences.areaOfInterest || !preferences.preferredJob}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Upload Resume</h2>
                  <p className="text-sm text-muted-foreground mb-6">We'll parse your skills and projects to find the best matches.</p>
                </div>

                <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center bg-card/50">
                  {preferences.resumeUploaded ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                      </div>
                      <p className="font-medium text-success">Resume uploaded successfully!</p>
                      <p className="text-sm text-muted-foreground mt-1">Analyzing profile...</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-brand-purple">
                        <Upload className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-medium mb-1">Drag and drop your resume here</p>
                      <p className="text-xs text-muted-foreground mb-6">Supports PDF, DOCX (Max 5MB)</p>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange} 
                      />
                      <Button onClick={handleUploadClick} variant="outline" size="lg" className="w-full rounded-xl">
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4 mt-6">
                  {!preferences.resumeUploaded && (
                    <Button variant="ghost" className="text-muted-foreground text-sm" onClick={handleSkip}>
                      Skip for now
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress indicators */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
            <motion.div 
              className="h-full gradient-brand"
              initial={{ width: "50%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
