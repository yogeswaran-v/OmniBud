export const PLAN_LIMITS = {
  free: {
    minutesPerDay: 5,
    maxVideoMinutes: 5,
    maxCloneSampleSeconds: 30,
    queueSlots: 1,
    watermark: true,
    maxVoiceProfiles: 3,
  },
  pro: {
    minutesPerDay: 120,
    maxVideoMinutes: 60,
    maxCloneSampleSeconds: 300,
    queueSlots: 10,
    watermark: false,
    maxVoiceProfiles: 50,
  },
}

export const FREE_LANGUAGES = ['English', 'Hindi', 'Spanish']

export const ALL_LANGUAGES = [
  'English','Hindi','Spanish','French','Mandarin','Arabic',
  'Portuguese','Bengali','Tamil','Swahili','Japanese','Korean',
  'German','Italian','Russian','Turkish','Vietnamese','Thai',
  'Urdu','Punjabi',
]

export const VOICES = [
  { id: '1', name: 'Aria',   accent: 'American',    gender: 'Female', tone: 'Warm',          pro: false, emoji: '🎙' },
  { id: '2', name: 'Marcus', accent: 'British',     gender: 'Male',   tone: 'Authoritative', pro: false, emoji: '🎙' },
  { id: '3', name: 'Zara',   accent: 'Indian',      gender: 'Female', tone: 'Clear',         pro: false, emoji: '🎙' },
  { id: '4', name: 'Leo',    accent: 'Australian',  gender: 'Male',   tone: 'Casual',        pro: false, emoji: '🎙' },
  { id: '5', name: 'Mei',    accent: 'Mandarin',    gender: 'Female', tone: 'Crisp',         pro: true,  emoji: '⭐' },
  { id: '6', name: 'Ravi',   accent: 'South Asian', gender: 'Male',   tone: 'Deep',          pro: true,  emoji: '⭐' },
]

export const VOICE_PREVIEW_TEXTS: Record<string, string> = {
  '1': 'Hi, I\'m Aria. Warm and clear, ready to bring your words to life.',
  '2': 'Hello, Marcus here. Authoritative, precise, and distinctly British.',
  '3': 'Namaste, I\'m Zara. Crisp and clear, with an Indian accent.',
  '4': 'Hey there, Leo here. Laid-back Australian vibes, mate.',
  '5': 'Hello, I\'m Mei. Studio quality, sharp and refined.',
  '6': 'Greetings, I\'m Ravi. Deep, resonant, and commanding.',
}
