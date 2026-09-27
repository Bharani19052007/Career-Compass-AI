export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  skills: string[];
  match: number;
  posted: string;
  remote: boolean;
  experience: string;
  description: string;
  responsibilities: string[];
  preferred: string[];
  benefits: string[];
  banner: string;
};

const logos = ["🚀", "🧠", "⚡", "🌐", "🛰️", "🎨", "🔮", "🧬", "📡", "🛠️"];

export const jobs: Job[] = [
  {
    id: "job-1",
    title: "Senior Full Stack Engineer",
    company: "TechNova",
    logo: logos[0],
    location: "Bangalore",
    salary: "₹35L - ₹45L",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    match: 94,
    posted: "2d ago",
    remote: true,
    experience: "5+ years",
    description: "We are looking for an experienced Full Stack Engineer to lead the development of our next-generation cloud platform.",
    responsibilities: ["Design scalable architectures", "Mentor junior devs", "Code reviews"],
    preferred: ["GraphQL", "Docker"],
    benefits: ["Health insurance", "Unlimited PTO"],
    banner: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "job-2",
    title: "Frontend Developer (Next.js)",
    company: "Creative Web Agency",
    logo: logos[5],
    location: "Mumbai",
    salary: "₹18L - ₹25L",
    skills: ["React", "Next.js", "Tailwind CSS"],
    match: 88,
    posted: "1d ago",
    remote: false,
    experience: "2-4 years",
    description: "Join our agency to build high-performance e-commerce sites for global brands.",
    responsibilities: ["Develop UI components", "Optimize for web vitals"],
    preferred: ["Figma", "Framer Motion"],
    benefits: ["MacBook Pro", "Free lunches"],
    banner: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "job-3",
    title: "Backend Engineer",
    company: "FinTech Systems",
    logo: logos[2],
    location: "Hyderabad",
    salary: "₹25L - ₹32L",
    skills: ["Python", "Django", "PostgreSQL"],
    match: 82,
    posted: "4d ago",
    remote: true,
    experience: "3+ years",
    description: "Build robust APIs and microservices for our core payment gateway.",
    responsibilities: ["API development", "Database optimization"],
    preferred: ["Redis", "Kubernetes"],
    benefits: ["Annual bonus", "Gym membership"],
    banner: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "job-4",
    title: "DevOps Engineer",
    company: "CloudScale",
    logo: logos[3],
    location: "Pune",
    salary: "₹28L - ₹40L",
    skills: ["AWS", "Terraform", "CI/CD", "Docker"],
    match: 75,
    posted: "5h ago",
    remote: true,
    experience: "4+ years",
    description: "Help us automate deployments and manage our growing AWS infrastructure.",
    responsibilities: ["Maintain CI/CD pipelines", "Infrastructure as code"],
    preferred: ["Python", "Ansible"],
    benefits: ["Internet allowance", "Flexible hours"],
    banner: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "job-5",
    title: "AI/ML Engineer",
    company: "DeepData",
    logo: logos[1],
    location: "Delhi NCR",
    salary: "₹40L - ₹55L",
    skills: ["Python", "PyTorch", "NLP", "TensorFlow"],
    match: 91,
    posted: "3d ago",
    remote: false,
    experience: "3-5 years",
    description: "Work on cutting-edge LLMs and conversational AI agents.",
    responsibilities: ["Train models", "Deploy ML pipelines"],
    preferred: ["MLOps", "C++"],
    benefits: ["Stock options", "Research grants"],
    banner: "from-indigo-500/20 to-violet-500/20",
  },
  {
    id: "job-6",
    title: "React Native Developer",
    company: "AppStudio",
    logo: logos[8],
    location: "Chennai",
    salary: "₹15L - ₹22L",
    skills: ["React Native", "TypeScript", "Redux"],
    match: 78,
    posted: "1w ago",
    remote: true,
    experience: "1-3 years",
    description: "Build cross-platform mobile applications for our startup clients.",
    responsibilities: ["Build mobile UIs", "Integrate REST APIs"],
    preferred: ["Swift", "Kotlin"],
    benefits: ["Work from anywhere", "Learning budget"],
    banner: "from-yellow-500/20 to-amber-500/20",
  }
];

export const courses = [
  { id: "c1", title: "Advanced React Patterns", platform: "Frontend Masters", rating: 4.9, duration: "8h 45m", level: "Advanced", thumb: "🚀" },
  { id: "c2", title: "System Design Interview Prep", platform: "Educative", rating: 4.8, duration: "12h 30m", level: "Intermediate", thumb: "🏗️" },
  { id: "c3", title: "Mastering Tailwind CSS", platform: "YouTube", rating: 4.7, duration: "4h 15m", level: "Beginner", thumb: "🎨" },
  { id: "c4", title: "The Complete Guide to Next.js 14", platform: "Udemy", rating: 4.6, duration: "22h", level: "Intermediate", thumb: "⚡" },
];

export const projects = [
  { id: "p1", title: "Full-Stack Job Board", difficulty: "Hard", tech: ["Next.js", "Prisma", "PostgreSQL", "Tailwind"], time: "2-3 weeks" },
  { id: "p2", title: "Real-time Chat App", difficulty: "Medium", tech: ["React", "Socket.io", "Node.js", "MongoDB"], time: "1-2 weeks" },
  { id: "p3", title: "AI Image Generator UI", difficulty: "Medium", tech: ["React", "Tailwind", "OpenAI API"], time: "1 week" },
];

export const notifications = [
  { id: "n1", type: "match", title: "New 90%+ match found at Google", time: "10m ago" },
  { id: "n2", type: "status", title: "Application viewed by TechNova", time: "2h ago" },
  { id: "n3", type: "interview", title: "Interview reminder: Creative Web Agency in 24h", time: "5h ago" },
];

export const trackerData = {
  Saved: jobs.slice(0, 2),
  Applied: jobs.slice(2, 4),
  Shortlisted: jobs.slice(4, 5),
  Interview: jobs.slice(5, 6),
  Offer: [],
  Rejected: [],
} as Record<string, Job[]>;

export const skills = [
  { name: "React", you: 90, required: 85 },
  { name: "TypeScript", you: 75, required: 80 },
  { name: "Node.js", you: 80, required: 70 },
  { name: "Next.js", you: 60, required: 80 },
  { name: "AWS", you: 40, required: 65 },
];

export const atsBreakdown = [
  { label: "Keyword Match", score: 85 },
  { label: "Formatting & Parsing", score: 95 },
  { label: "Impact & Metrics", score: 60 },
  { label: "Skill Relevancy", score: 88 },
  { label: "Section Headings", score: 100 },
  { label: "Grammar & Spelling", score: 98 },
];

export const applicationTrend = [
  { m: "Jan", applied: 12, interviews: 2 },
  { m: "Feb", applied: 18, interviews: 3 },
  { m: "Mar", applied: 25, interviews: 5 },
  { m: "Apr", applied: 30, interviews: 8 },
  { m: "May", applied: 22, interviews: 7 },
  { m: "Jun", applied: 15, interviews: 4 },
];

export const profile = {
  name: "Alex Developer",
  headline: "Full Stack Engineer | React & Node.js",
  email: "alex.dev@example.com",
  location: "Bangalore, India",
  role: "Senior Software Engineer",
  skills: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
  interests: ["FinTech", "EdTech", "Open Source"],
  avatar: "AD",
};
