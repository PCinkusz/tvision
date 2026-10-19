export interface Stream { u: string; q: string | null; r?: string; a?: string; h?: 0 | 1 }
export interface Channel { id: string; n: string; l: string | null; c: string[]; g: string[]; s: Stream[] }
export interface CountryMeta { code: string; name: string; flag: string; count: number }
export type GroupId = 'sports' | 'docs' | 'news' | 'movies' | 'entertainment'
export const GROUPS: { id: GroupId; title: string }[] = [
  { id: 'sports', title: 'Sport' },
  { id: 'docs', title: 'Documentaries & History' },
  { id: 'news', title: 'News' },
  { id: 'movies', title: 'Movies & Series' },
  { id: 'entertainment', title: 'Entertainment & Comedy' },
]
export type View = { name: 'live' | 'history' | 'favorites' } | { name: 'group'; g: GroupId }
