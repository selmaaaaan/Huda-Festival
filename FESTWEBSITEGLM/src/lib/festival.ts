// Shared types matching the API routes — used across all festival sections

export type Category = 'BIDAYAH' | 'ULA' | 'THANIYAH' | 'THANAWIYYAH' | 'ALIYAH' | 'KULLIYYAH'
export type ProgrammeType = 'Stage' | 'Non-Stage' | 'Sports'

export interface TeamInfo {
  code: string
  name: string
  color: string
}

export interface Stats {
  teams: number
  programmes: number
  candidates: number
  results: number
  venues: number
  days: number
  dates: string[]
}

export interface Programme {
  id: string
  code: string
  name: string
  category: string
  type: ProgrammeType
  format: string
  quota: number
  groupSize: number
  maxParticipants: number
  description: string | null
  day: number | null
  venue: string | null
  startTime: string | null
  endTime: string | null
  resultCount: number
  isResultPublished: boolean
}

export type ScheduleItem = Programme

export interface ScheduleResponse {
  days: { day: number; date: string; label: string }[]
  venues: string[]
  items: ScheduleItem[]
}

export interface TeamStanding {
  rank: number
  id: string
  code: string
  name: string
  color: string
  motto: string | null
  points: number
  members: number
  golds: number
}

export interface TopIndividual {
  rank: number
  id: string
  name: string
  admissionNo: number
  category: string
  class: number
  points: number
  team: TeamInfo
}

export interface LeaderboardResponse {
  teamLeaderboard: TeamStanding[]
  topIndividuals: TopIndividual[]
  topProgrammes: unknown[]
}

export interface ResultEntry {
  name: string
  team: string
  teamColor: string
  rank: number | null
  grade: string | null
  points: number
  admissionNo: number
}

export interface ResultGroup {
  programme: {
    id: string
    code: string
    name: string
    type: string
    category: string
    venue: string | null
    day: number | null
  }
  winners: ResultEntry[]
}

export interface CandidateResult {
  id: string
  programme: { code: string; name: string; type: string; venue?: string | null; day?: number | null }
  rank: number | null
  grade: string | null
  points: number
}

export interface Candidate {
  id: string
  name: string
  admissionNo: number
  category: string
  class: number
  points: number
  wins: number
  podiums: number
  team: TeamInfo
  results: CandidateResult[]
}

export interface GalleryItem {
  id: string
  title: string
  category: string
  url: string
  caption: string | null
}

export interface Announcement {
  id: string
  title: string
  body: string | null
  priority: string
  createdAt: string
}

// ---------- helpers ----------
export const CATEGORY_LABELS: Record<string, string> = {
  BIDAYAH: 'Bidāyah — Foundation (Grades 1–2)',
  ULA: 'ʾŪlā — Primary (Grades 3–4)',
  THANIYAH: 'Thāniyah — Junior (Grades 5–6)',
  THANAWIYYAH: 'Thānawiyyah — Middle (Grades 7–8)',
  ALIYAH: 'ʿĀliyah — Senior (Grades 9–10)',
  KULLIYYAH: 'Kulliyyah — College-wide (Open)',
}

export const CATEGORY_SHORT: Record<string, string> = {
  BIDAYAH: 'Bidāyah',
  ULA: 'ʾŪlā',
  THANIYAH: 'Thāniyah',
  THANAWIYYAH: 'Thānawiyyah',
  ALIYAH: 'ʿĀliyah',
  KULLIYYAH: 'Kulliyyah',
}

export const TYPE_ICONS: Record<string, string> = {
  Stage: '🎭',
  'Non-Stage': '✍️',
  Sports: '🏃',
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}

export const RANK_LABEL = (rank: number | null) =>
  rank === 1 ? '🥇 1st' : rank === 2 ? '🥈 2nd' : rank === 3 ? '🥉 3rd' : null
