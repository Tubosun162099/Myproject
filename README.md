# NHS Supporting Statement Builder

A web tool that writes tailored, ATS-optimised supporting statements (1,200–1,500 words) for nurses applying to NHS roles (Jobtrain, Trac, NHS Jobs, NHS Scotland).

## How it works

1. **My profile** – the nurse fills this in once (saved in their browser, editable any time):
   - Work history: hospital, location, years of experience, role and department
   - Qualifications & certifications
   - Continuous Professional Development (CPD)
   - Equipment used, key achievements, skills, areas of expertise
2. **Write a statement** – paste the job title, Trust, job description, person specification and Trust values, enter your previous job titles and where you worked (add as many as you need), optionally paste a supporting statement you already wrote for this job, then click **Write my supporting statement**.

The statement follows a fixed structure: an opening hook, a CAR-method (Context, Action, Result) response to **every** person specification criterion, wording that mirrors the job description's keywords, the Trust's values woven throughout, and a closing call to action. Only the qualifications, CPD and skills relevant to that job are used.

The previous job titles and workplaces entered for each application are named exactly as entered; if left blank, past employment is described only as "Registered Nurse at [hospital] for [years]". A pasted earlier statement is mined for facts and examples, then rewritten rather than copied. Everything else is written in the language of the new job, and the examples centre on the skills it asks for. The real role and department are used only to keep examples consistent with work the nurse has actually done, and the statement never claims a title, department or qualification that isn't in the profile.

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
