export type ActivityType = 'icebreaker' | 'boardgame' | 'movie' | 'music' | 'party';
export type VenueType = 'classroom' | 'hall' | 'outdoor' | 'online';
export type MaterialCategory = '文具纸张' | '食品饮品' | '设备道具' | '场地布置';

export interface MaterialTemplate {
  name: string;
  category: MaterialCategory;
  unit: string;
  unitPrice: number;
  fixedQuantity?: number;
  perPersonQuantity?: number;
  optional?: boolean;
  borrowable?: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  name: string;
  tagline: string;
  description: string;
  duration: number;
  minPeople: number;
  maxPeople: number;
  venues: VenueType[];
  materials: MaterialTemplate[];
  gameplay: string[];
  hostGuide: string[];
  energy: '轻松' | '适中' | '高能';
}

export interface ActivitySetup {
  type: ActivityType;
  people: number;
  budget: number;
  duration: number;
  venue: VenueType;
  goal: string;
}

export interface MaterialLine extends MaterialTemplate {
  id: string;
  quantity: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  start: number;
  end: number;
  kind: 'opening' | 'activity' | 'closing';
}

export interface Schedule {
  items: ScheduleItem[];
  totalMinutes: number;
  overflowMinutes: number;
  isOverTime: boolean;
}

export interface ActivityPlan {
  id: string;
  createdAt: string;
  setup: ActivitySetup;
  selectedIds: string[];
  materials: MaterialLine[];
  contingencyNote: string;
  eventId?: string;
  optionId?: string;
  aiNote?: string;
}

export interface ContingencyOption {
  id: string;
  label: string;
  description: string;
  note: string;
}

export interface Contingency {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  options: ContingencyOption[];
}

export interface ContingencyResult {
  setup: ActivitySetup;
  activities: Activity[];
  materials: MaterialLine[];
  note: string;
}

export interface LocalState {
  recentPlan: ActivityPlan | null;
  favorites: ActivityPlan[];
  history: ActivityPlan[];
}
