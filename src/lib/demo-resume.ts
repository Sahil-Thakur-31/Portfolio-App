import type { ResumeContact, ResumeSkills } from "./database.types";

// Placeholder content shown whenever a profile has no resume data configured yet
// (new signups, unconfigured usernames, or a failed data fetch). Intentionally
// reads as "fill this in" template copy, not a real or fictional person.
export const DEMO_FULL_NAME = "Your Name";

export const DEMO_ROLE_TITLE = "Your Role & Title Here";

export const DEMO_SUMMARY =
  "Your objective goes here. Describe your role, key skills, and the kind of opportunities you're looking for.";

export const DEMO_SKILLS: ResumeSkills = {
  languages: ["Your Languages"],
  frameworks: ["Your Frameworks"],
  tools: ["Your Tools"],
};

export const DEMO_EDUCATION = [
  {
    degree: "Your Degree",
    institution: "Your Institution",
    period: "20XX - 20XX",
    location: "Your Location",
    details: ["Add your achievements, coursework, or GPA here"],
  },
];

export const DEMO_EXPERIENCE = [
  {
    title: "Your Internship Title",
    company: "Your Company",
    period: "20XX - 20XX",
    location: "Your Location",
    bullets: [
      "Describe a key responsibility or achievement here",
      "Add another accomplishment with measurable impact",
    ],
  },
  {
    title: "Your Job Title",
    company: "Your Company",
    period: "20XX - Present",
    location: "Your Location",
    bullets: [
      "Describe a key responsibility or achievement here",
      "Add another accomplishment with measurable impact",
    ],
  },
];

export const DEMO_CONTACT: ResumeContact = {
  email: "your.email@example.com",
  phone: "Your Phone Number",
  location: "Your Location",
  github: "https://github.com/yourusername",
  linkedin: "https://linkedin.com/in/yourusername",
};

export const DEMO_AVATAR_URL = "/avatar-placeholder.svg";

export const DEMO_ABOUT = {
  headline: "Add Your Headline Here",
  intro: "Write a short introduction about what you do and what you're passionate about.",
  whoIAmTitle: "Who I Am & My Goal",
  whoIAm: "Describe your background, what you're studying or have studied, and what you build.",
  philosophyTitle: "Core Philosophy",
  philosophy: "Share the principles that guide how you approach your work.",
  focusAreas: ["Your Focus Area", "Another Focus Area", "A Third Focus Area"],
};

export const DEMO_CONFIG_SNIPPET = {
  fileName: "your-config.ts",
  variableName: "you",
  role: "Your Role",
  education: "Your Education",
  passions: ["Your Passion", "Another Passion", "A Third Passion"],
  currentlyBuilding: "Your Current Project",
  funFact: "Add a fun fact about yourself",
};

export function initialsTag(fullName: string) {
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
  return initials || "XX";
}
