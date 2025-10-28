export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'url' | 'number';
    required: boolean;
}

export interface Application {
    id: number;
    streamer: {
      name: string;
      followers: number;
    };
    tournament: string;
    language: string;
    submissionDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    customFields: Record<string, string>; // To store data from dynamic form fields
}

export interface Tournament {
    id: number;
    title: string;
    game: string;
    date: string;
    applications: number;
    bannerUrl: string;
    formFields: FormField[];
}

export interface Stats {
    totalApplications: number;
    approved: number;
    rejected: number;
    pending: number;
}

export interface LiveStreamer {
    name: string;
    game: string;
    title: string;

    language: string;
    viewers: number;
}

export interface LiveStream {
    id: number;
    streamerName: string;
    platform: 'Twitch' | 'YouTube';
    game: string;
    title: string;
    currentViewers: number;
    peakViewers: number;
    avatarUrl: string;
    streamUrl: string;
}

export interface AnalyticsData {
    onlineTournaments: number;
    approvedStreamers: number;
    liveStreamersCount: number;
    currentViewers: number;
    maxViewers: number;
    liveStreamers: LiveStreamer[];
    viewershipHistory: { name: string; viewers: number }[];
}