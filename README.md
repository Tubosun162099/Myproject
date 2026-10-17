# NHS Supporting Statement Builder

A web tool that writes tailored, ATS-optimised supporting statements (1,200–1,500 words) for nurses applying to NHS roles (Jobtrain, Trac, NHS Jobs, NHS Scotland).

## How it works

1. **My profile** – the nurse fills this in once (saved in their browser, editable any time):
   - Work history: hospital, location, years of experience, role and department
   - Qualifications & certifications
   - Continuous Professional Development (CPD)
   - Equipment used, key achievements, skills, areas of expertise
2. **Write a statement** – paste the job title, Trust, job description, person specification and Trust values, then click **Write my supporting statement**.

The statement follows a fixed structure: an opening hook, a CAR-method (Context, Action, Result) response to **every** person specification criterion, wording that mirrors the job description's keywords, the Trust's values woven throughout, and a closing call to action. Only the qualifications, CPD and skills relevant to that job are used.

The candidate's experience is presented through the lens of the new role, with transferable skills drawn out explicitly. The statement never claims a job title, department or qualification that isn't in the profile, because NHS recruiters verify employment history and references.

The prompt lives in [`lib/prompt.ts`](lib/prompt.ts) if you want to adjust the tone or structure.

## Run locally

Requires Node.js 20+ and an [Anthropic API key](https://console.anthropic.com/).

```bash
npm install
cp .env.example .env.local   # then put your key in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploy

Deploys as-is to Vercel (or any Node host). Set the `ANTHROPIC_API_KEY` environment variable in the project settings. Generation streams for up to ~2 minutes, so the API route sets `maxDuration = 300`.
