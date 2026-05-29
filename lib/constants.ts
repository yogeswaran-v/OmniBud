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
  { id: '1', name: 'Aria',   accent: 'American English',  gender: 'Female', tone: 'Warm' },
  { id: '2', name: 'Marcus', accent: 'British English',   gender: 'Male',   tone: 'Authoritative' },
  { id: '3', name: 'Zara',   accent: 'Indian English',    gender: 'Female', tone: 'Clear' },
  { id: '4', name: 'Leo',    accent: 'Australian',        gender: 'Male',   tone: 'Casual' },
  { id: '5', name: 'Mei',    accent: 'Mandarin-accented', gender: 'Female', tone: 'Crisp' },
  { id: '6', name: 'Ravi',   accent: 'South Indian',      gender: 'Male',   tone: 'Deep' },
]
