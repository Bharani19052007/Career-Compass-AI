import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { callGroqAI } from "@/lib/groq";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/resume")({
  component: ResumePage,
});

type ParsedData = {
  name: string;
  email: string;
  phone: string;
  education: string[];
  experience: string[];
  skills: string[];
  projects: { title: string; description: string }[];
};

function ResumePage() {
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("Aarav_Resume.pdf");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { updatePreferences } = useOnboarding();
  
  const [parsedData, setParsedData] = useState<ParsedData>({
    name: "",
    email: "",
    phone: "",
    education: [],
    experience: [],
    skills: [],
    projects: []
  });

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Use standard unpkg CDN for the specific version we have, or fallback to fake worker if it fails.
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      
      return fullText;
    } catch (err) {
      console.error("Error extracting text from PDF", err);
      alert("Could not extract text from PDF. It might be scanned or the PDF parser failed.");
      return "";
    }
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      console.error("Error extracting text from DOCX", err);
      return "";
    }
  };

  const parseResumeData = (text: string): ParsedData => {
    const data: ParsedData = {
      name: "Unknown Name",
      email: "Not found",
      phone: "Not found",
      education: [],
      experience: [],
      skills: [],
      projects: [],
    };

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length > 0) {
       const possibleName = lines.find(l => l.length < 30 && l.length > 2 && !l.includes("@"));
       if (possibleName) data.name = possibleName;
    }

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) data.email = emailMatch[0];

    const phoneMatch = text.match(/(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    if (phoneMatch) data.phone = phoneMatch[0];

    const commonSkills = ["React", "TypeScript", "JavaScript", "Python", "Node.js", "Java", "C++", "C#", "SQL", "MongoDB", "AWS", "Docker", "Git", "HTML", "CSS", "Tailwind", "Next.js", "Angular", "Vue", "Go", "Rust"];
    const foundSkills = commonSkills.filter(skill => {
      if (skill === "C++" || skill === "C#") return text.includes(skill);
      return new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i').test(text);
    });
    if (foundSkills.length > 0) {
      data.skills = foundSkills;
    } else {
      data.skills = ["No technical skills detected"];
    }

    const eduKeywords = ["B.Tech", "B.S", "M.S", "PhD", "University", "College", "Institute", "Bachelor", "Master", "Degree", "School"];
    const foundEdu = lines.filter(line => eduKeywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()))).slice(0, 3);
    if (foundEdu.length > 0) data.education = foundEdu;
    else data.education = ["Education details not found"];

    const expKeywords = ["Intern", "Engineer", "Developer", "Manager", "Analyst", "Freelance", "Project", "Lead"];
    const foundExp = lines.filter(line => expKeywords.some(kw => line.toLowerCase().includes(kw.toLowerCase())) && line.length > 10 && line.length < 100).slice(0, 3);
    if (foundExp.length > 0) data.experience = foundExp;
    else data.experience = ["Experience details not found"];

    return data;
  };

  const simulateAndParse = async (file: File | null) => {
    setProgress(0); 
    setUploaded(false);

    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { return 90; } 
        return p + 8;
      });
    }, 120);

    let finalData = parsedData;

    let extractedText = "";
    if (file) {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        extractedText = await extractTextFromPDF(file);
      } else if (file.name.toLowerCase().endsWith(".docx")) {
        extractedText = await extractTextFromDOCX(file);
      }
    }
      
    if (extractedText) {
      try {
        const systemPrompt = `You are a resume parsing AI. Extract the candidate's details from the provided resume text into a strict JSON object with this exact structure:
        {
          "name": "string",
          "email": "string",
          "phone": "string",
          "education": ["string", "string"],
          "experience": ["string", "string"],
          "skills": ["string", "string"],
          "projects": [{"title": "string", "description": "string"}]
        }
        Only return the JSON object. Limit education to 3 items, experience to 5 items, projects to 10 items, and skills to top 15 items.`;
        
        // Truncate text to avoid huge context window issues just in case
        const safeText = extractedText.substring(0, 15000);
        
        const result = await callGroqAI(systemPrompt, safeText, true);
        const parsed = JSON.parse(result);
        
        // Ensure structure matches
        finalData = {
          name: parsed.name || "Unknown",
          email: parsed.email || "",
          phone: parsed.phone || "",
          education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : ["No education listed"],
          experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience : ["No experience listed"],
          skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ["No skills detected"],
          projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : []
        };
      } catch (err) {
        console.error("AI parsing failed, falling back to heuristic parser:", err);
        // Only run legacy parser if we have real extracted text, else use hardcoded fallback
        if (file) {
          finalData = parseResumeData(extractedText);
        }
      }
    }

    clearInterval(t);
    setParsedData(finalData);
    setProgress(100);
    setUploaded(true);

    // Save to user profile and update onboarding state
    updatePreferences({ resumeUploaded: true });
    if (user) {
      supabase.from("user_profiles").upsert({
        user_id: user.id,
        skills: finalData.skills
      }).then();
      
      if (finalData.projects.length > 0) {
        // Insert parsed projects to user_projects table
        const projectsToInsert = finalData.projects.map((p: any) => ({
          user_id: user.id,
          title: p.title,
          description: p.description
        }));
        
        supabase.from("user_projects").insert(projectsToInsert).then();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      simulateAndParse(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    setDrag(false); 
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      simulateAndParse(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
        <p className="text-muted-foreground">Upload your resume — we'll parse skills, experience and projects.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            className={`glass-strong flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-colors ${drag ? "border-brand-purple bg-accent/40" : "border-border"}`}
          >
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="grid h-16 w-16 place-items-center rounded-2xl gradient-brand shadow-glow">
              <UploadCloud className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">Drop your resume here</h3>
            <p className="mt-1 text-sm text-muted-foreground">PDF or DOCX · up to 10MB</p>
            <div className="mt-4 flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange} 
              />
              <Button onClick={() => fileInputRef.current?.click()} className="gradient-brand text-white shadow-glow">Choose file</Button>
            </div>
            {progress > 0 && (
              <div className="mt-6 w-full max-w-md">
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span className="truncate pr-4">{fileName}</span><span>{progress}%</span>
                </div>
                <Progress value={progress} />
                {uploaded && (
                  <div className="mt-3 flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-1 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Uploaded & parsed</span>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Analyze Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {uploaded && (
            <div className="glass mt-6 rounded-2xl p-6 min-w-0 overflow-hidden">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-purple" />
                <h3 className="font-semibold">Resume preview</h3>
              </div>
              <div className="rounded-xl bg-secondary p-6 text-sm min-w-0 overflow-hidden">
                <div className="mb-3 border-b pb-3 border-border/50 min-w-0">
                  <div className="text-lg font-bold break-words">{parsedData.name}</div>
                  <div className="text-muted-foreground break-words">
                    {parsedData.email} {parsedData.phone && `· ${parsedData.phone}`}
                  </div>
                </div>
                <div className="mb-3 min-w-0">
                  <div className="font-semibold">Education</div>
                  {parsedData.education.map((edu, idx) => (
                    <div key={idx} className="text-muted-foreground break-words">{edu}</div>
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">Experience</div>
                  {parsedData.experience.map((exp, idx) => (
                    <div key={idx} className="text-muted-foreground break-words">{exp}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 min-w-0">
          <div className="glass rounded-2xl p-5 min-w-0">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-purple" /><h3 className="font-semibold">Extracted skills</h3></div>
            {parsedData.skills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {parsedData.skills.map((s) => <Badge key={s} className="gradient-brand text-white border-0">{s}</Badge>)}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Upload your resume to extract skills.</p>
            )}
          </div>
          <div className="glass rounded-2xl p-5 min-w-0">
            <h3 className="font-semibold">Education</h3>
            {parsedData.education.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {parsedData.education.map((edu, idx) => (
                  <li key={idx} className="truncate">{edu}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No education data yet.</p>
            )}
          </div>
          <div className="glass rounded-2xl p-5 min-w-0">
            <h3 className="font-semibold">Experience</h3>
            {parsedData.experience.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                {parsedData.experience.map((exp, idx) => (
                  <li key={idx} className="truncate">{exp}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No experience data yet.</p>
            )}
          </div>
          <div className="glass rounded-2xl p-5 min-w-0">
            <h3 className="font-semibold">Projects</h3>
            {parsedData.projects.length > 0 ? (
              <ul className="mt-2 space-y-3 text-sm text-muted-foreground">
                {parsedData.projects.map((proj, idx) => (
                  <li key={idx}>
                    <div className="font-medium text-foreground">{proj.title}</div>
                    <div className="line-clamp-2 text-xs">{proj.description}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No projects parsed.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
