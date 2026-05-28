export type Plan = 'free' | 'pro'
export type JobType = 'tts' | 'clone' | 'dub'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Profile {
  id: string
  plan: Plan
  stripe_customer_id?: string
  created_at: string
}

export interface Job {
  id: string
  user_id: string
  type: JobType
  status: JobStatus
  input: Record<string, unknown>
  output_url?: string
  error?: string
  progress: number
  created_at: string
  completed_at?: string
}

export interface UsageLog {
  user_id: string
  date: string
  minutes_used: number
  jobs_count: number
}
