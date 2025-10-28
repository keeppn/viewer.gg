import { useState } from 'react';
import { Application, Tournament, Stats, AnalyticsData, LiveStream } from '../types';

const initialApplications: Application[] = [
  { id: 1, streamer: { name: 'StreamerOne', followers: 15000 }, tournament: 'Valorant Champions', language: 'English', submissionDate: '2024-07-20', status: 'Approved' },
  { id: 2, streamer: { name: 'GamerGirl', followers: 25000 }, tournament: 'Valorant Champions', language: 'English', submissionDate: '2024-07-21', status: 'Approved' },
  { id: 3, streamer: { name: 'ProPlayerX', followers: 5000 }, tournament: 'Apex Legends Global Series', language: 'Spanish', submissionDate: '2024-07-22', status: 'Pending' },
  { id: 4, streamer: { name: 'CaptainStream', followers: 8000 }, tournament: 'Valorant Champions', language: 'French', submissionDate: '2024-07-22', status: 'Rejected' },
  { id: 5, streamer: { name: 'TheStrategist', followers: 120000 }, tournament: 'Apex Legends Global Series', language: 'English', submissionDate: '2024-07-23', status: 'Approved' },
  { id: 6, streamer: { name: 'NoobMaster69', followers: 2000 }, tournament: 'Valorant Champions', language: 'English', submissionDate: '2024-07-24', status: 'Pending' },
  { id: 7, streamer: { name: 'ElJefe', followers: 95000 }, tournament: 'League of Legends Worlds', language: 'Spanish', submissionDate: '2024-07-25', status: 'Approved' },
  { id: 8, streamer: { name: 'LeStreamer', followers: 45000 }, tournament: 'League of Legends Worlds', language: 'French', submissionDate: '2024-07-25', status: 'Pending' },
];

const initialTournaments: Tournament[] = [
    { id: 1, title: 'Valorant Champions', game: 'Valorant', date: '2024-08-01', applications: 120, bannerUrl: 'https://picsum.photos/seed/valorant/800/200', formFields: [
        { id: 'twitch-url', label: 'Twitch Channel URL', type: 'url', required: true },
        { id: 'avg-viewers', label: 'Average Concurrent Viewers', type: 'number', required: true },
        { id: 'twitter-handle', label: 'Twitter Handle', type: 'text', required: false },
    ]},
    { id: 2, title: 'Apex Legends Global Series', game: 'Apex Legends', date: '2024-08-15', applications: 85, bannerUrl: 'https://picsum.photos/seed/apex/800/200', formFields: [] },
    { id: 3, title: 'League of Legends Worlds', game: 'League of Legends', date: '2024-09-10', applications: 250, bannerUrl: 'https://picsum.photos/seed/lol/800/200', formFields: [] },
];

const initialLiveStreams: LiveStream[] = [
    { id: 1, streamerName: 'TheStrategist', platform: 'Twitch', game: 'Apex Legends', title: 'ALGS Finals - Tactical Breakdown', currentViewers: 22000, peakViewers: 25400, avatarUrl: 'https://i.pravatar.cc/150?u=strategist', streamUrl: '#' },
    { id: 2, streamerName: 'StreamerOne', platform: 'Twitch', game: 'Valorant', title: 'CHAMPIONS FINALS! CO-STREAM', currentViewers: 12500, peakViewers: 14800, avatarUrl: 'https://i.pravatar.cc/150?u=streamerone', streamUrl: '#' },
    { id: 3, streamerName: 'GamerGirl', platform: 'YouTube', game: 'Valorant', title: 'Crazy plays at VCT!', currentViewers: 8300, peakViewers: 9100, avatarUrl: 'https://i.pravatar.cc/150?u=gamergirl', streamUrl: '#' },
    { id: 4, streamerName: 'ProPlayerX', platform: 'Twitch', game: 'Apex Legends', title: 'Road to Predator #1', currentViewers: 4500, peakViewers: 6200, avatarUrl: 'https://i.pravatar.cc/150?u=proplayerx', streamUrl: '#' },
    { id: 5, streamerName: 'ElJefe', platform: 'Twitch', game: 'League of Legends', title: 'Worlds Finals Spanish Cast!', currentViewers: 31000, peakViewers: 45000, avatarUrl: 'https://i.pravatar.cc/150?u=eljefe', streamUrl: '#' },
    { id: 6, streamerName: 'LeStreamer', platform: 'YouTube', game: 'League of Legends', title: 'Analyse des finales des Worlds', currentViewers: 11000, peakViewers: 13500, avatarUrl: 'https://i.pravatar.cc/150?u=lestreamer', streamUrl: '#' },
]

const initialAnalytics: AnalyticsData = {
    onlineTournaments: 2,
    approvedStreamers: 150,
    liveStreamersCount: 32,
    currentViewers: 145830,
    maxViewers: 225400,
    liveStreamers: [
        { name: 'StreamerOne', game: 'Valorant', title: 'CHAMPIONS FINALS! CO-STREAM', language: 'English', viewers: 12500 },
        { name: 'GamerGirl', game: 'Valorant', title: 'Crazy plays at VCT!', language: 'English', viewers: 8300 },
        { name: 'TheStrategist', game: 'Apex Legends', title: 'ALGS Finals - Tactical Breakdown', language: 'English', viewers: 22000 },
        { name: 'ElJefe', game: 'League of Legends', title: 'Worlds Finals Spanish Cast!', language: 'Spanish', viewers: 31000},
    ],
    viewershipHistory: [
        { name: '12 AM', viewers: 55000 }, { name: '3 AM', viewers: 40000 }, { name: '6 AM', viewers: 70000 },
        { name: '9 AM', viewers: 90000 }, { name: '12 PM', viewers: 160000 }, { name: '3 PM', viewers: 195000 },
        { name: '6 PM', viewers: 225000 }, { name: '9 PM', viewers: 145830 },
    ],
};

export const useMockData = () => {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(initialLiveStreams);

  const stats: Stats = {
    totalApplications: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    pending: applications.filter(a => a.status === 'Pending').length,
  };

  const analyticsData: AnalyticsData = initialAnalytics;
  
  return { applications, setApplications, tournaments, setTournaments, stats, analyticsData, liveStreams };
};

export type { Application, Tournament };