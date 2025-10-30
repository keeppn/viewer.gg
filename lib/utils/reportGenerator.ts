import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsData, Tournament, ReportConfig } from '../../types';

export const generatePDFReport = async (
  tournament: Tournament,
  analytics: AnalyticsData,
  config: ReportConfig
): Promise<Blob> => {
  const doc = new jsPDF();
  const { branding, sections } = config;
  const accentColor = branding.accent_color || '#387B66';

  // Convert hex to RGB for jsPDF
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 56, g: 123, b: 102 };
  };

  const rgb = hexToRgb(accentColor);
  let yPosition = 20;

  // Header with logo
  if (branding.logo_url) {
    try {
      // In production, load and add logo image
      // doc.addImage(branding.logo_url, 'PNG', 15, 15, 40, 20);
      yPosition = 45;
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
  }

  // Title
  doc.setFontSize(24);
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.text(tournament.title, 15, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`${tournament.game} - Performance Report`, 15, yPosition);
  
  yPosition += 5;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, yPosition);

  yPosition += 15;

  // Executive Summary
  if (sections.executive_summary) {
    doc.setFontSize(16);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Executive Summary', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const summaryData = [
      ['Total Applications', analytics.total_applications.toString()],
      ['Approved Applications', analytics.approved_applications.toString()],
      ['Live Streamers', analytics.live_streamers_count.toString()],
      ['Peak Concurrent Viewers', analytics.peak_concurrent_viewers.toLocaleString()],
      ['Total Hours Streamed', Math.round(analytics.total_hours_streamed).toLocaleString()],
      ['Unique Viewers (Est.)', analytics.unique_viewers_estimate.toLocaleString()]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [rgb.r, rgb.g, rgb.b] },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Application Funnel
  if (sections.application_funnel && yPosition < 250) {
    doc.setFontSize(16);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Application Funnel', 15, yPosition);
    yPosition += 10;

    const funnelData = [
      ['Total Applications', analytics.total_applications.toString()],
      ['Approved', `${analytics.approved_applications} (${Math.round(analytics.approved_applications / analytics.total_applications * 100)}%)`],
      ['Rejected', `${analytics.rejected_applications} (${Math.round(analytics.rejected_applications / analytics.total_applications * 100)}%)`],
      ['Pending', `${analytics.pending_applications} (${Math.round(analytics.pending_applications / analytics.total_applications * 100)}%)`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Status', 'Count']],
      body: funnelData,
      theme: 'striped',
      headStyles: { fillColor: [rgb.r, rgb.g, rgb.b] },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Top Performers
  if (sections.top_performers) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Top Co-streamers', 15, yPosition);
    yPosition += 10;

    const topStreamersData = analytics.top_streamers.slice(0, 10).map((streamer, index) => [
      (index + 1).toString(),
      streamer.name,
      streamer.peak_viewers.toLocaleString(),
      streamer.avg_viewers.toLocaleString(),
      Math.round(streamer.hours_streamed).toString()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Streamer', 'Peak Viewers', 'Avg Viewers', 'Hours']],
      body: topStreamersData,
      theme: 'grid',
      headStyles: { fillColor: [rgb.r, rgb.g, rgb.b] },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Platform Analysis
  if (sections.platform_analysis) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Platform Distribution', 15, yPosition);
    yPosition += 10;

    const platformData = Object.entries(analytics.viewership_by_platform).map(([platform, viewers]) => [
      platform,
      viewers.toLocaleString(),
      `${Math.round((viewers as number) / analytics.total_live_viewers * 100)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Platform', 'Viewers', 'Share']],
      body: platformData,
      theme: 'striped',
      headStyles: { fillColor: [rgb.r, rgb.g, rgb.b] },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Demographic Breakdown
  if (sections.demographic_breakdown) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Language Distribution', 15, yPosition);
    yPosition += 10;

    const languageData = Object.entries(analytics.viewership_by_language).map(([language, viewers]) => [
      language,
      viewers.toLocaleString(),
      `${Math.round((viewers as number) / analytics.total_live_viewers * 100)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Language', 'Viewers', 'Share']],
      body: languageData,
      theme: 'striped',
      headStyles: { fillColor: [rgb.r, rgb.g, rgb.b] },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Custom Commentary
  if (sections.custom_commentary) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Commentary', 15, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(sections.custom_commentary, 180);
    doc.text(splitText, 15, yPosition);
  }

  // Footer with sponsor logos
  if (branding.sponsor_logos && branding.sponsor_logos.length > 0) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Powered by viewer.gg', 15, 285);
      
      if (branding.footer_text) {
        doc.text(branding.footer_text, 105, 285, { align: 'center' });
      }
    }
  }

  return doc.output('blob');
};

export const generateCSVReport = (
  tournament: Tournament,
  analytics: AnalyticsData,
  config: ReportConfig
): string => {
  const rows: string[][] = [];

  // Header
  rows.push(['viewer.gg Report']);
  rows.push([tournament.title]);
  rows.push([tournament.game]);
  rows.push([`Generated: ${new Date().toLocaleDateString()}`]);
  rows.push([]);

  // Executive Summary
  if (config.sections.executive_summary) {
    rows.push(['EXECUTIVE SUMMARY']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Applications', analytics.total_applications.toString()]);
    rows.push(['Approved Applications', analytics.approved_applications.toString()]);
    rows.push(['Rejected Applications', analytics.rejected_applications.toString()]);
    rows.push(['Pending Applications', analytics.pending_applications.toString()]);
    rows.push(['Live Streamers', analytics.live_streamers_count.toString()]);
    rows.push(['Peak Concurrent Viewers', analytics.peak_concurrent_viewers.toString()]);
    rows.push(['Average Concurrent Viewers', analytics.average_concurrent_viewers.toString()]);
    rows.push(['Total Hours Streamed', Math.round(analytics.total_hours_streamed).toString()]);
    rows.push(['Unique Viewers Estimate', analytics.unique_viewers_estimate.toString()]);
    rows.push([]);
  }

  // Top Performers
  if (config.sections.top_performers) {
    rows.push(['TOP CO-STREAMERS']);
    rows.push(['Rank', 'Streamer', 'Peak Viewers', 'Avg Viewers', 'Hours Streamed']);
    analytics.top_streamers.forEach((streamer, index) => {
      rows.push([
        (index + 1).toString(),
        streamer.name,
        streamer.peak_viewers.toString(),
        streamer.avg_viewers.toString(),
        Math.round(streamer.hours_streamed).toString()
      ]);
    });
    rows.push([]);
  }

  // Platform Distribution
  if (config.sections.platform_analysis) {
    rows.push(['PLATFORM DISTRIBUTION']);
    rows.push(['Platform', 'Viewers', 'Percentage']);
    Object.entries(analytics.viewership_by_platform).forEach(([platform, viewers]) => {
      rows.push([
        platform,
        viewers.toString(),
        `${Math.round((viewers as number) / analytics.total_live_viewers * 100)}%`
      ]);
    });
    rows.push([]);
  }

  // Language Distribution
  if (config.sections.demographic_breakdown) {
    rows.push(['LANGUAGE DISTRIBUTION']);
    rows.push(['Language', 'Viewers', 'Percentage']);
    Object.entries(analytics.viewership_by_language).forEach(([language, viewers]) => {
      rows.push([
        language,
        viewers.toString(),
        `${Math.round((viewers as number) / analytics.total_live_viewers * 100)}%`
      ]);
    });
    rows.push([]);
  }

  // Viewership Timeline
  if (config.sections.viewership_trends) {
    rows.push(['VIEWERSHIP TIMELINE']);
    rows.push(['Time', 'Viewers', 'Streamers']);
    analytics.viewership_by_hour.forEach(snapshot => {
      rows.push([
        snapshot.hour,
        snapshot.viewers.toString(),
        snapshot.streamers.toString()
      ]);
    });
    rows.push([]);
  }

  // Convert to CSV string
  return rows.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};

export const downloadReport = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
