# Analytics Dashboard Improvement Plan

## 📊 Current State Analysis

### What viewer.gg Does
- **Co-streaming Management Platform** for tournament organizers
- Manages co-streamers across **Twitch, YouTube, Kick**
- Tracks **real-time viewership** during tournament events
- **Twitch API integration** polls streams every 3-5 minutes
- Collects **viewership snapshots** for historical analytics
- Helps organizers create **sponsor-ready reports**

### Current Analytics Features
1. **4 Stat Cards**: Current Viewers, Peak Viewers, Live Streamers, Approved Streamers
2. **Viewership History Chart**: 24-hour timeline
3. **Viewers by Game**: Pie chart breakdown
4. **Applications by Language**: Pie chart breakdown
5. **Live Streamers Table**: Real-time stream list

### Available Data Sources
- **applications**: status, streamer details, submission/review dates, custom form data
- **live_streams**: current/peak/average viewers, stream duration, platform, language, game, stream URL
- **viewership_snapshots**: timestamp-based viewer counts, streamer counts
- **tournaments**: dates, status, form fields, organization data

---

## 🎯 Tournament Organizer Needs

Based on research, tournament organizers need analytics for:

### 1. **Sponsor Reporting**
- Total reach and impressions
- Platform distribution
- Geographic/language breakdown
- ROI metrics (views per dollar spent)
- Professional visual reports

### 2. **Event Performance**
- Peak concurrent viewers with timeline
- Total hours watched
- Stream health monitoring
- Comparison vs. previous events
- Pre/during/post-event analysis

### 3. **Streamer Management**
- Top performer leaderboards
- Stream consistency tracking
- Application funnel analytics
- Quality scoring metrics
- Reliability indicators

### 4. **Strategic Planning**
- Time-of-day viewership patterns
- Platform effectiveness
- Language/region insights
- Tournament comparison
- Growth trends

---

## 🚀 Proposed Improvements

### New Analytics Sections

#### **1. Performance Overview** (Hero Section)
- **Large KPI Cards** with trends:
  - Total Hours Watched (↑ vs last event)
  - Peak Concurrent Viewers (with timestamp)
  - Total Unique Viewers Estimate
  - Average Concurrent Viewers
  - Total Streams
  - Average Stream Duration
  - Approval Rate
  - Total Impressions

#### **2. Viewership Timeline** (Enhanced)
- **Multi-metric Area Chart**:
  - Concurrent viewers (primary line)
  - Active streamers count (secondary line)
  - Annotations for peak moments
  - Time range selector (24h, 7d, 30d, All Time)
  - Zoom and pan capabilities
  - Tooltip with detailed breakdown

#### **3. Streamer Performance**
- **Top Performers Leaderboard**:
  - Rank by: Peak Viewers, Avg Viewers, Total Hours, Engagement
  - Show: Avatar, Name, Platform, Peak, Average, Duration, Status
  - Medal icons for top 3
  - Sortable columns
  - Platform badges

- **Performance Distribution**:
  - Histogram of average viewership ranges
  - Stream duration distribution
  - Engagement rate scatter plot

#### **4. Application Analytics**
- **Funnel Visualization**:
  - Total Applications → Pending → Approved → Live Streaming
  - Conversion rates at each stage
  - Color-coded drop-off indicators

- **Application Timeline**:
  - Submissions per day/week
  - Review time analysis
  - Status change trends

- **Quality Metrics**:
  - Average follower count
  - Average past viewership
  - Platform distribution
  - Language breakdown

#### **5. Platform & Geographic Insights**
- **Platform Comparison**:
  - Bar chart: Viewers by platform (Twitch, YouTube, Kick)
  - Average viewers per platform
  - Stream count per platform
  - Platform preference trends

- **Language Distribution**:
  - Donut chart with percentages
  - Top 10 languages
  - Viewer count per language
  - Growth indicators

- **Time Zone Analysis**:
  - Viewership by hour (heatmap)
  - Peak times by region
  - Optimal streaming windows

#### **6. Engagement & Reach**
- **Engagement Metrics**:
  - Estimated unique viewers
  - Total impressions (viewers × duration)
  - Average watch time
  - Viewer retention curve

- **Reach Breakdown**:
  - New vs. returning viewers (estimate)
  - Channel growth during event
  - Cross-platform reach

#### **7. Tournament Comparison**
- **Side-by-Side Metrics**:
  - Compare 2-4 tournaments
  - Growth percentages
  - Best performers comparison
  - Platform mix evolution

#### **8. Real-Time Monitoring** (Live Tab)
- **Stream Health Dashboard**:
  - Grid of live streams with thumbnails
  - Status indicators (🟢 Live, 🔴 Offline, ⚠️ Issues)
  - Live viewer counts with sparklines
  - Alert system for drops >30%
  - Quick actions (view stream, contact streamer)

#### **9. Export & Reports**
- **Quick Export Options**:
  - PDF Report (sponsor-ready)
  - CSV Data Export
  - PNG Chart Exports
  - Social Media Graphics (auto-generated stats cards)

---

## 🎨 UI/UX Design Improvements

### Color Palette (Existing Brand Colors)
```
Primary Purple:   #9381FF
Accent Lime:      #DAFF7C
Accent Orange:    #fd934e
Accent Red:       #ef4444
Success Green:    #10b981
Warning Yellow:   #f59e0b
Info Blue:        #3b82f6

Chart Colors (8-color palette):
- #DAFF7C (Lime)
- #9381FF (Purple)
- #00F0FF (Cyan)
- #FFB800 (Amber)
- #66BB6A (Green)
- #FFF59D (Yellow)
- #4CAF50 (Dark Green)
- #FFEE58 (Light Yellow)
```

### Visual Components

#### **Stat Cards**
- Glassmorph design with backdrop-blur
- Gradient borders (purple/lime)
- Large numbers with compact units (123.4K)
- Trend indicators (↑ +12% vs last week)
- Sparkline micro-charts
- Animated counter on load
- Hover effect with glow

#### **Charts**
- **Area Charts**: Gradient fills (lime to transparent)
- **Line Charts**: Smooth curves with glow effects
- **Bar Charts**: Rounded corners, gradient bars
- **Pie/Donut Charts**: Inner glow, percentage labels
- **Heatmaps**: Purple-to-lime gradient scale
- Dark theme with subtle gridlines
- Interactive tooltips with multiple data points
- Smooth transitions on data updates

#### **Tables**
- Alternating row backgrounds (very subtle)
- Hover state with glow
- Sortable column headers
- Pagination or virtual scrolling
- Avatar images with platform badges
- Color-coded status indicators
- Expandable rows for details

#### **Filters & Controls**
- Tournament selector dropdown (glassmorph)
- Date range picker (calendar UI)
- Time granularity toggle (Hour, Day, Week)
- Metric selector chips
- Export button with dropdown menu
- Auto-refresh toggle for live data

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Analytics Dashboard                    [Tournament ▼] [⚙]│
│ [Last 24h ▼] [Auto-refresh: ON]          [Export Report ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ 123K │ │ 45.2K│ │ 12.5K│ │ 8.3K │ │  156 │ │ 94%  │    │
│ │Hours │ │ Peak │ │  Avg │ │Unique│ │Streams│ │Approv│    │
│ │Watch │ │Viewer│ │Viewer│ │Viewer│ │       │ │ Rate │    │
│ │+12%↑ │ │+8% ↑ │ │+5% ↑ │ │+15%↑ │ │ -3% ↓│ │+2% ↑ │    │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 📈 Viewership Timeline                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │          ╱╲                      ╱╲                    │   │
│ │     ╱╲  ╱  ╲  ╱╲            ╱╲  ╱  ╲                   │   │
│ │ ___╱  ╲╱    ╲╱  ╲__________╱  ╲╱    ╲__________       │   │
│ │ [Concurrent Viewers]  [Active Streamers]              │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────────────────┐ ┌────────────────────────────┐ │
│ │ 🏆 Top Performers        │ │ 📊 Application Funnel      │ │
│ ├──────────────────────────┤ ├────────────────────────────┤ │
│ │ 1. 🥇 Streamer A  12.5K  │ │  Applications    [245] ──┐ │ │
│ │ 2. 🥈 Streamer B   8.3K  │ │                          ↓ │ │
│ │ 3. 🥉 Streamer C   6.7K  │ │  Approved       [156] ──┐ │ │
│ │ 4.    Streamer D   5.2K  │ │                          ↓ │ │
│ │ 5.    Streamer E   4.1K  │ │  Live Streaming [142] ──┘ │ │
│ └──────────────────────────┘ └────────────────────────────┘ │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────────────────┐ ┌────────────────────────────┐ │
│ │ 🌍 Platform Distribution │ │ 🗣️ Language Distribution   │ │
│ │                          │ │                            │ │
│ │     ██████ Twitch        │ │      English    [45%] ████ │ │
│ │     ███ YouTube          │ │      Spanish    [22%] ██   │ │
│ │     ██ Kick              │ │      Portuguese [15%] █    │ │
│ │                          │ │      French     [10%] █    │ │
│ └──────────────────────────┘ └────────────────────────────┘ │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🔴 Live Streamers (142 Active)                   [View All] │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar] Streamer   | Game      | Platform | 🟢 12.5K  │ │
│ │ [Avatar] Streamer   | Game      | Platform | 🟢  8.3K  │ │
│ │ [Avatar] Streamer   | Game      | Platform | 🟢  6.7K  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Implementation

### New Components to Build

1. **`EnhancedStatCard.tsx`** - Stat card with trends, sparklines, animations
2. **`ViewershipTimeline.tsx`** - Multi-metric area chart with annotations
3. **`StreamerLeaderboard.tsx`** - Sortable table with avatars, medals, platform badges
4. **`ApplicationFunnel.tsx`** - Funnel visualization with conversion rates
5. **`PlatformComparison.tsx`** - Horizontal bar chart
6. **`LanguageBreakdown.tsx`** - Donut chart with percentages
7. **`TimeHeatmap.tsx`** - Hour-by-hour viewership heatmap
8. **`TournamentSelector.tsx`** - Dropdown with search and recent tournaments
9. **`DateRangePicker.tsx`** - Calendar-based date range selector
10. **`ExportMenu.tsx`** - Export options dropdown
11. **`LiveStreamGrid.tsx`** - Real-time grid with thumbnails and health indicators
12. **`ComparisonView.tsx`** - Side-by-side tournament comparison

### Data Enhancements

#### New Computed Metrics
```typescript
interface EnhancedAnalytics extends AnalyticsData {
  // Engagement
  total_hours_watched: number;
  estimated_unique_viewers: number;
  total_impressions: number;
  average_watch_time: number;

  // Performance
  top_streamers: TopStreamer[];
  stream_duration_avg: number;
  stream_health_score: number;

  // Application
  approval_rate: number;
  average_review_time: number;
  application_velocity: number; // submissions per day

  // Trends
  viewer_trend: 'up' | 'down' | 'stable';
  viewer_trend_percentage: number;
  peak_time: string;
  peak_time_viewers: number;

  // Platform
  platform_breakdown: { [key: string]: number };
  platform_performance: {
    platform: string;
    avg_viewers: number;
    stream_count: number;
    total_hours: number;
  }[];

  // Time analysis
  viewership_by_time_of_day: {
    hour: number;
    avg_viewers: number;
    peak_viewers: number;
  }[];

  // Comparison
  vs_previous_event?: {
    metric: string;
    change: number;
    percentage: number;
  }[];
}
```

### API Enhancements

Add to `analyticsApi`:
```typescript
// Get analytics with comparison
async getAnalyticsWithComparison(
  tournamentId: string,
  compareWithId?: string
): Promise<EnhancedAnalytics>

// Get tournament performance summary
async getTournamentSummary(
  tournamentId: string
): Promise<TournamentSummary>

// Get real-time stats (cached for 30 seconds)
async getRealtimeStats(
  tournamentId: string
): Promise<RealtimeStats>

// Get streamer leaderboard
async getStreamerLeaderboard(
  tournamentId: string,
  sortBy: 'peak' | 'average' | 'duration'
): Promise<StreamerRanking[]>

// Get time-based analytics
async getTimeAnalytics(
  tournamentId: string,
  granularity: 'hour' | 'day' | 'week'
): Promise<TimeSeriesData>
```

### Chart Library
Use **Recharts** (already imported) with enhancements:
- Custom tooltips with glassmorph design
- Gradient fills and strokes
- Smooth animations
- Responsive containers
- Interactive legends
- Cross-chart synchronization

---

## 🎯 Priority Implementation Order

### Phase 1: Core Enhancements (Must Have)
1. ✅ Enhanced stat cards with trends
2. ✅ Improved viewership timeline with multiple metrics
3. ✅ Top performers leaderboard
4. ✅ Platform distribution chart
5. ✅ Application funnel visualization
6. ✅ Tournament selector and date range filter

### Phase 2: Advanced Analytics (Should Have)
1. Time-of-day heatmap
2. Language breakdown enhancements
3. Stream health monitoring
4. Engagement metrics section
5. Export functionality

### Phase 3: Strategic Insights (Nice to Have)
1. Tournament comparison view
2. Predictive analytics
3. Automated insights/recommendations
4. Social media auto-generated graphics
5. Mobile-optimized view

---

## 📊 Success Metrics

Track improvement through:
- **User Engagement**: Time spent on analytics page
- **Feature Usage**: Which charts/filters are most used
- **Export Rate**: How often organizers generate reports
- **User Feedback**: Survey responses from tournament organizers
- **Decision Making**: How analytics influence tournament planning

---

## 🚦 Next Steps

1. **Review & Approve** this plan
2. **Design mockups** in Figma (optional)
3. **Implement Phase 1** components
4. **Test with sample data**
5. **Gather feedback** from tournament organizers
6. **Iterate and improve**

---

**Color Scheme Reference:**
- Background: `#1F1F1F` / `#2A2A2A`
- Primary: `#9381FF` (Purple)
- Accent: `#DAFF7C` (Lime)
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`
- Text: `#FFFFFF` / `rgba(255,255,255,0.6)`
- Borders: `rgba(255,255,255,0.1)`
