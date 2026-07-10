export type DayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type SessionType =
  | "laboratory"
  | "fablab"
  | "nstp"
  | "break"
  | "available";

export interface ScheduleEntry {
  id: string;
  day: DayName;
  /** 24h "HH:MM", or null when the source note gives no exact time */
  start: string | null;
  end: string | null;
  type: SessionType;
  title: string;
  room?: string;
  recurrence?: string;
  note?: string;
}

export interface LegendItem {
  type: SessionType;
  label: string;
  swatchClass: string;
}
