// Core Types
export type Platform = 'Twitch' | 'YouTube' | 'Kick';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
export type UserRole = 'admin' | 'community_manager' | 'marketing' | 'viewer';

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  discord_guild_id?: string;
  created_at: string;
  updated_at: string;
}

// Tournament & Application Forms
export type FormFieldType = 'text' | 'textarea' | 'url' | 'number' | 'radio' | 'checkbox' | 'dropdown' | 'email';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For radio, checkbox, dropdown
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  description?: string;
  start_date: string;
  end_date: string;
  banner_url?: string;
  logo_url?: string;
  organization_id: string;
  form_fields: FormField[];
  custom_fields: FormField[];
  discord_role_id?: string;
  discord_channel_id?: string;
  approval_message?: string;
  rejection_message?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  application_count: number;
  created_at: string;
  updated_at: string;
}

// Application Types
export interface StreamerProfile {
  name: string;
  platform: Platform;
  channel_url: string;
  email: string;
  discord_username: string;
  avg_viewers: number;
  follower_count: number;
  subscriber_count?: number;
  primary_languages: string[];
  avatar_url?: string;
}

export interface Application {
  id: string;
  tournament_id: string;
  tournament?: Tournament;
  streamer: StreamerProfile;
  status: ApplicationStatus;
  submission_date: string;
  reviewed_date?: string;
  reviewed_by?: string;
  custom_data: Record<string, any>;
  previous_experience?: string;
  availability_confirmed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Analytics & Live Streaming
export interface LiveStream {
  id: string;
  application_id: string;
  streamer_name: string;
  platform: Platform;
  game: string;
  title: string;
  current_viewers: number;
  peak_viewers: number;
  average_viewers: number;
  stream_start: string;
  stream_end?: string;
  avatar_url: string;
  stream_url: string;
  language: string;
  is_live: boolean;
  tournament_id: string;
}

export interface ViewershipSnapshot {
  id: string;
  tournament_id: string;
  live_stream_id?: string;
  timestamp: string;
  viewer_count: number;
  streamer_count: number;
}

export interface AnalyticsData {
  tournament_id?: string;
  date_range: {
    start: string;
    end: string;
  };
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  live_streamers_count: number;
  total_live_viewers: number;
  peak_concurrent_viewers: number;
  average_concurrent_viewers: number;
  total_hours_streamed: number;
  unique_viewers_estimate: number;
  viewership_by_hour: Array<{
    hour: string;
    viewers: number;
    streamers: number;
  }>;
  viewership_by_platform: Record<Platform, number>;
  viewership_by_language: Record<string, number>;
  top_streamers: Array<{
    name: string;
    peak_viewers: number;
    avg_viewers: number;
    hours_streamed: number;
  }>;
}

// Statistics
export interface Stats {
  totalApplications: number;
  approved: number;
  rejected: number;
  pending: number;
  liveTournaments?: number;
  totalViewers?: number;
}

// Report Generation
export interface ReportConfig {
  id: string;
  tournament_id: string;
  name: string;
  format: 'pdf' | 'csv';
  branding: {
    logo_url?: string;
    sponsor_logos?: string[];
    accent_color: string;
    header_text?: string;
    footer_text?: string;
  };
  sections: {
    executive_summary: boolean;
    application_funnel: boolean;
    viewership_trends: boolean;
    top_performers: boolean;
    demographic_breakdown: boolean;
    geographic_distribution: boolean;
    platform_analysis: boolean;
    custom_commentary?: string;
  };
  date_range?: {
    start: string;
    end: string;
  };
  created_at: string;
}

export interface GeneratedReport {
  id: string;
  config_id: string;
  tournament_id: string;
  file_url: string;
  file_size: number;
  generated_at: string;
}

// Discord Integration
export interface DiscordConfig {
  id: string;
  organization_id: string;
  guild_id: string;
  guild_name: string;
  bot_token: string;
  role_name?: string;
  default_role_id?: string;
  announcement_channel_id?: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: string;
}

export interface DiscordMessage {
  id: string;
  application_id: string;
  discord_user_id: string;
  message_type: 'approval' | 'rejection' | 'update';
  sent_at: string;
  success: boolean;
  error?: string;
}

// Notification System
export interface Notification {
  id: string;
  user_id: string;
  type: 'application_submitted' | 'application_approved' | 'application_rejected' | 'tournament_started' | 'stream_milestone';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

// Dashboard Context
export interface DashboardContextType {
  user: User | null;
  organization: Organization | null;
  applications: Application[];
  tournaments: Tournament[];
  stats: Stats;
  analyticsData: AnalyticsData | null;
  liveStreams: LiveStream[];
  updateApplicationStatus: (id: string, status: ApplicationStatus, notes?: string) => Promise<void>;
  addTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'application_count'>) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  addApplication: (application: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  refetchData: () => Promise<void>;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
