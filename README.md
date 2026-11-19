# GEEM

A personal gym coach in your pocket.

## What's here (step 1: the library)

- **Workouts:** Leg Day, Chest Day, Back Day, Arm Day, Shoulders, Abs & Core, Full Body.
- **"I have no equipment" switch:** shows exercises you can do with just your body. The app remembers the setting.
- **Exercise pages:** demo video slot, body map of the muscles worked, step-by-step instructions, what equipment you need and what to use instead, mistakes to avoid, and benefits.
- **Machine pages:** what it is, which workouts use it, muscles worked, how to set it up, safety tips, and the exercises you can do on it.
- **Search** across workouts, exercises and machines.

All content lives in `lib/` (`exercises.ts`, `equipment.ts`, `data.ts`). Each exercise and machine has an optional `video` field: once a demo video is generated and approved, setting it there shows it to everyone.

## Coming next

1. **Scan a machine:** take a photo, OpenAI identifies it and opens its page.
2. **Video generation and approval:** generate a demo once, approve it, and save it to the library.

## Run it

```bash
npm install
npm run dev
```
