import { callGroqAI } from "./groq";
import { NormalizedJob } from "./job-sources/types";

export interface AIMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  explanation: string;
}

export async function analyzeJobMatch(job: NormalizedJob, userSkills: string[], userExperience: string): Promise<AIMatchResult> {
  const systemPrompt = `You are CareerPilot AI, an expert career counselor and technical recruiter.
Your task is to analyze a job description against a user's profile/skills and provide a structured JSON assessment.
Be strict and realistic. Do not give a 100% score unless it's a perfect match.

Respond ONLY with a valid JSON object matching this schema:
{
  "matchScore": number (0 to 100),
  "matchingSkills": string[] (skills the user has that the job requires),
  "missingSkills": string[] (skills the job requires that the user lacks),
  "suggestions": string[] (2-3 actionable tips for their resume or learning path),
  "explanation": string (A short, 2-sentence summary of why they got this score)
}`;

  const userPrompt = `
USER PROFILE:
Skills: ${userSkills.length > 0 ? userSkills.join(", ") : "Entry-level / Student"}
Experience/Background: ${userExperience || "Fresh Graduate"}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description:
${job.description.substring(0, 3000)} // Truncated to avoid token limits
`;

  try {
    const response = await callGroqAI(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(response);
    return {
      matchScore: parsed.matchScore || 0,
      matchingSkills: parsed.matchingSkills || [],
      missingSkills: parsed.missingSkills || [],
      suggestions: parsed.suggestions || [],
      explanation: parsed.explanation || "No explanation provided.",
    };
  } catch (error) {
    console.error("AI Matcher Error:", error);
    // Return a fallback so the UI doesn't crash
    return {
      matchScore: 50,
      matchingSkills: [],
      missingSkills: ["Analysis failed to load"],
      suggestions: ["Try refreshing the page to regenerate the AI match"],
      explanation: "We couldn't generate an AI match at this time due to a technical error."
    };
  }
}

export interface SkillGapResult {
  skills: { name: string; you: number; required: number }[];
  suggestions: string[];
  roadmap: { w: string; t: string }[];
}

export async function analyzeSkillGap(jobs: NormalizedJob[], userSkills: string[], preferredRole?: string): Promise<SkillGapResult> {
  const systemPrompt = `You are a Career AI analyzing a user's skills against their target jobs.
Respond ONLY with a valid JSON object matching this schema:
{
  "skills": [ { "name": "Skill Name", "you": 60, "required": 90 } ],
  "suggestions": [ "Actionable tip 1" ],
  "roadmap": [ { "w": "Week 1", "t": "Milestone" } ]
}
Generate exactly 5 critical skills based on the job descriptions. 'you' is the user's estimated proficiency (0-100) based on their listed skills. 'required' is what the jobs demand (0-100).
Generate 3 highly specific actionable suggestions.
Generate a 4-step learning roadmap (w = time range, t = milestone title).`;

  const userPrompt = `
USER SKILLS / INTERESTS: ${userSkills.join(", ")}
TARGET JOBS (User's Saved Jobs):
${jobs.length > 0 ? jobs.slice(0, 3).map(j => `- ${j.title} at ${j.company}\nReqs: ${j.description.substring(0, 600)}`).join("\n") : (preferredRole ? `${preferredRole} roles` : "Software Engineer roles")}
`;

  try {
    const response = await callGroqAI(systemPrompt, userPrompt, true);
    const parsed = JSON.parse(response);
    return {
      skills: parsed.skills || [],
      suggestions: parsed.suggestions || [],
      roadmap: parsed.roadmap || []
    };
  } catch (error) {
    console.error("AI Skill Gap Error:", error);
    throw error;
  }
}
