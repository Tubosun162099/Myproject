import type { Equipment } from "./types";

export const equipment: Equipment[] = [
  {
    id: "barbell",
    name: "Barbell",
    summary: "A long straight bar you load with weight plates. Used for big lifts like squats, bench press and deadlifts.",
    setup: [
      "Slide the same weight plates onto each end.",
      "Lock each side with a collar so the plates can't slide off.",
      "Grip the bar evenly, using the smooth rings on the bar to line up your hands.",
    ],
    safety: [
      "Always use collars.",
      "Start with just the bar until the movement feels natural.",
      "For bench press and squats, use a rack with safety bars or ask someone to spot you.",
    ],
  },
  {
    id: "dumbbells",
    name: "Dumbbells",
    summary: "Short hand weights, usually on a rack in pairs from light to heavy. Good for almost every muscle.",
    setup: [
      "Pick a pair you can lift for the full set with good form.",
      "Lift them off the rack with a straight back, bending at the knees.",
      "Put them back on the rack in the right spot when you're done.",
    ],
    safety: [
      "Don't drop them from a height. Lower them to the floor under control.",
      "Keep your wrists straight, not bent back.",
    ],
  },
  {
    id: "kettlebell",
    name: "Kettlebell",
    summary: "A round weight with a handle on top. Great for swings, goblet squats and full-body moves.",
    setup: [
      "Choose a weight you can hold at your chest comfortably.",
      "Grip the handle with both hands for two-handed moves.",
    ],
    safety: [
      "Keep a clear space around you for swings.",
      "Let your hips do the work in a swing, not your arms or lower back.",
    ],
  },
  {
    id: "ez-bar",
    name: "EZ Curl Bar",
    summary: "A short barbell with a zig-zag shape that is easier on your wrists. Used mostly for arm exercises.",
    setup: [
      "Load equal plates on each end and add collars.",
      "Hold the angled parts of the bar so your wrists rest at a natural angle.",
    ],
    safety: ["Use collars.", "Start light. Arm muscles are small and tire quickly."],
  },
  {
    id: "flat-bench",
    name: "Flat Bench",
    summary: "A padded bench you lie or sit on. Used with dumbbells or a barbell for chest, back and arm exercises.",
    setup: [
      "Place it on flat ground where it doesn't wobble.",
      "Leave space on both sides for your arms and weights.",
    ],
    safety: ["Keep both feet flat on the floor for balance.", "Wipe it down after use."],
  },
  {
    id: "adjustable-bench",
    name: "Adjustable Bench",
    summary: "A bench whose back rest tilts up. Used for incline presses and seated shoulder work.",
    setup: [
      "Pull the pin or lever and raise the back rest to the angle you need.",
      "For incline press, about 30 degrees is enough.",
      "Check the pin is locked before you sit down.",
    ],
    safety: ["Always check the back rest is locked in place before adding weight."],
  },
  {
    id: "squat-rack",
    name: "Squat Rack",
    summary: "A tall steel frame that holds a barbell at shoulder height, with safety bars to catch the bar if you can't finish a rep.",
    setup: [
      "Set the bar hooks at about the height of your upper chest.",
      "Set the safety bars just below the lowest point of your squat.",
      "Load the bar evenly and add collars.",
    ],
    safety: [
      "Always set the safety bars.",
      "If you can't stand up, lower the bar onto the safety bars and step out.",
    ],
  },
  {
    id: "smith-machine",
    name: "Smith Machine",
    summary: "A barbell fixed on rails so it only moves straight up and down. A safer way to squat or press without a spotter.",
    setup: [
      "Set the safety stops just below your lowest point.",
      "Stand or lie so the bar lines up with where it needs to move.",
      "Twist the bar to unhook it, and twist back to hook it when you finish.",
    ],
    safety: ["Set the safety stops every time.", "Practise hooking and unhooking with an empty bar first."],
  },
  {
    id: "leg-press",
    name: "Leg Press Machine",
    summary: "You sit back and push a weighted platform away with your feet. Works your thighs and glutes without loading your back.",
    setup: [
      "Sit with your back flat against the pad.",
      "Put your feet shoulder-width apart in the middle of the platform.",
      "Push the platform up a little and release the safety handles.",
    ],
    safety: [
      "Don't fully lock your knees at the top.",
      "Don't let your lower back lift off the seat at the bottom.",
      "Put the safety handles back on before you get out.",
    ],
  },
  {
    id: "leg-extension",
    name: "Leg Extension Machine",
    summary: "You sit and straighten your legs against a padded bar. Isolates the front of your thighs.",
    setup: [
      "Adjust the back rest so your knees line up with the machine's pivot point.",
      "Set the shin pad just above your ankles.",
      "Choose the weight with the pin.",
    ],
    safety: ["Move slowly and don't swing the weight.", "Stop if you feel pain in the knee joint."],
  },
  {
    id: "leg-curl",
    name: "Leg Curl Machine",
    summary: "You curl a padded bar toward you using the back of your legs. Isolates the hamstrings.",
    setup: [
      "Line your knees up with the machine's pivot point.",
      "Set the pad so it sits just above your heels.",
      "Choose the weight with the pin.",
    ],
    safety: ["Keep your hips down on the pad.", "Lower the weight slowly."],
  },
  {
    id: "calf-raise-machine",
    name: "Calf Raise Machine",
    summary: "You rise up onto your toes with weight on your shoulders or knees. Works the calves.",
    setup: [
      "Adjust the shoulder pads so you have to bend your knees slightly to get under them.",
      "Stand with the balls of your feet on the edge of the step.",
    ],
    safety: ["Keep your knees soft, not locked.", "Move through the full range slowly."],
  },
  {
    id: "cable-machine",
    name: "Cable Machine",
    summary: "A tall frame with pulleys and a weight stack. You clip on handles or ropes for pulls, presses and crunches.",
    setup: [
      "Slide the pulley to the height the exercise needs.",
      "Clip on the right attachment: handle, rope or bar.",
      "Choose the weight with the pin.",
    ],
    safety: [
      "Check the attachment clip is fully closed.",
      "Let the weight return slowly. Don't let the plates crash.",
    ],
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown Machine",
    summary: "You sit and pull a wide bar down to your chest. Builds a wider back and helps you work up to pull-ups.",
    setup: [
      "Set the knee pad so your thighs are held firmly down.",
      "Choose the weight with the pin.",
      "Stand up, grab the bar a little wider than your shoulders, and sit down.",
    ],
    safety: ["Pull to your upper chest, never behind your neck.", "Don't lean back a lot to swing the weight."],
  },
  {
    id: "seated-row",
    name: "Seated Row Machine",
    summary: "You sit and pull a handle toward your stomach. Works the middle of your back.",
    setup: [
      "Sit with your feet on the foot plates and knees slightly bent.",
      "Grab the handle and sit up tall.",
      "Choose the weight with the pin.",
    ],
    safety: ["Keep your back straight. Don't round it to reach the handle."],
  },
  {
    id: "chest-press-machine",
    name: "Chest Press Machine",
    summary: "You sit and push handles straight out in front of you. A safe way to train your chest without a spotter.",
    setup: [
      "Adjust the seat so the handles line up with the middle of your chest.",
      "Choose the weight with the pin.",
      "Sit with your back flat against the pad.",
    ],
    safety: ["Don't lock your elbows hard at the end.", "Keep your shoulders down and back."],
  },
  {
    id: "pec-deck",
    name: "Pec Deck Machine",
    summary: "You sit and bring two padded arms or handles together in front of you. Isolates the chest. Face the other way to train the back of your shoulders.",
    setup: [
      "Adjust the seat so the handles are at chest height.",
      "Set the arms so you feel a gentle stretch, not a strain, at the start.",
      "Choose the weight with the pin.",
    ],
    safety: ["Keep a slight bend in your elbows.", "Don't let the handles pull your arms too far back."],
  },
  {
    id: "shoulder-press-machine",
    name: "Shoulder Press Machine",
    summary: "You sit and press handles straight up over your head. A steady way to build your shoulders.",
    setup: [
      "Adjust the seat so the handles start at about shoulder height.",
      "Choose the weight with the pin.",
    ],
    safety: ["Keep your back against the pad.", "Don't arch your lower back to push the weight."],
  },
  {
    id: "pull-up-bar",
    name: "Pull-up Bar",
    summary: "A high bar you hang from. Used for pull-ups, chin-ups and hanging leg raises.",
    setup: [
      "Use a step or box to reach the bar if needed.",
      "Grip the bar with your hands a little wider than your shoulders.",
    ],
    safety: [
      "Lower yourself down under control. Don't drop.",
      "If you can't do a full pull-up yet, use the lat pulldown or an assisted machine.",
    ],
  },
  {
    id: "dip-station",
    name: "Dip Station",
    summary: "Two parallel bars at waist height. You hold yourself up and lower your body to train chest and triceps.",
    setup: ["Stand between the bars, grip both handles, and jump or step up to straight arms."],
    safety: ["Only go down until your shoulders are level with your elbows.", "Stop if you feel shoulder pain."],
  },
  {
    id: "preacher-bench",
    name: "Preacher Curl Bench",
    summary: "A seat with an angled arm pad. Keeps your upper arms still so your biceps do all the work.",
    setup: [
      "Adjust the seat so your armpits rest on the top of the pad.",
      "Use an EZ bar or dumbbells.",
    ],
    safety: ["Don't drop the weight fast at the bottom. It strains the elbow."],
  },
  {
    id: "ab-wheel",
    name: "Ab Wheel",
    summary: "A small wheel with handles. You roll it out in front of you to train your whole core.",
    setup: ["Kneel on a mat and hold both handles with the wheel under your shoulders."],
    safety: ["Only roll out as far as you can without your lower back sagging."],
  },
];
