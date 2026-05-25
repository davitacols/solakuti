export type SportsCompetition = {
  id: number;
  name: string;
  slug: string;
  country: string;
  logo_url?: string;
  is_featured: boolean;
  fixtures_count?: number;
};

export type SportsSeason = {
  id: number;
  competition: SportsCompetition;
  name: string;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
};

export type SportsTeam = {
  id: number;
  name: string;
  slug: string;
  short_name: string;
  country: string;
  crest_url?: string;
};

export type SportsVenue = {
  id: number;
  name: string;
  slug: string;
  city: string;
  country: string;
  capacity: number | null;
  surface: string;
};

export type SportsPlayer = {
  id: number;
  current_team: SportsTeam | null;
  name: string;
  slug: string;
  position: "goalkeeper" | "defender" | "midfielder" | "forward" | "coach" | "unknown";
  shirt_number: number | null;
  nationality: string;
  date_of_birth: string | null;
  height_cm: number | null;
  photo_url?: string;
};

export type FixtureStatus = "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled";

export type SportsFixtureEvent = {
  id: number;
  fixture: number;
  team: SportsTeam | null;
  event_type: "goal" | "card" | "substitution" | "var" | "penalty" | "missed_penalty" | "own_goal" | "red_card" | "yellow_card" | "period" | "info";
  period: string;
  minute: number | null;
  extra_minute: number | null;
  player_name: string;
  assist_name: string;
  related_player_name: string;
  detail: string;
  home_score: number | null;
  away_score: number | null;
  created_at: string;
};

export type SportsFixtureLineup = {
  id: number;
  fixture: number;
  team: SportsTeam;
  player: SportsPlayer | null;
  player_name: string;
  shirt_number: number | null;
  position: string;
  formation_position: number | null;
  is_starting: boolean;
  is_captain: boolean;
  rating: string | null;
};

export type SportsFixtureStatistic = {
  id: number;
  fixture: number;
  group: string;
  name: string;
  home_value: string;
  away_value: string;
  home_numeric: string | null;
  away_numeric: string | null;
  updated_at: string;
};

export type SportsFixtureMomentum = {
  id: number;
  fixture: number;
  minute: number;
  home_value: number;
  away_value: number;
};

export type SportsFixture = {
  id: number;
  competition: SportsCompetition;
  season: SportsSeason | null;
  home_team: SportsTeam;
  away_team: SportsTeam;
  kickoff_at: string;
  status: FixtureStatus;
  status_reason: string;
  period: string;
  minute: number | null;
  injury_time: number | null;
  home_score: number;
  away_score: number;
  venue: string;
  venue_detail: SportsVenue | null;
  round_name: string;
  referee: string;
  attendance: number | null;
  home_formation: string;
  away_formation: string;
  home_manager: string;
  away_manager: string;
  home_xg: string | null;
  away_xg: string | null;
  is_featured: boolean;
  last_synced_at?: string | null;
  updated_at: string;
  events?: SportsFixtureEvent[];
  lineups?: SportsFixtureLineup[];
  statistics?: SportsFixtureStatistic[];
  momentum?: SportsFixtureMomentum[];
};

export type SportsStanding = {
  id: number;
  competition: SportsCompetition;
  season: SportsSeason | null;
  team: SportsTeam;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string;
  updated_at: string;
};
