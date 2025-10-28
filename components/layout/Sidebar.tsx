import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Page } from '../../types';
import { OverviewIcon, TournamentIcon, AnalyticsIcon, ApplicationIcon, ReportIcon, SettingsIcon, LogoIcon, LiveIcon } from '../icons/Icons';

const NavItem: React.FC<{
  page: Page;
  icon: React.ReactNode;
  path: string;
}> = ({ page, icon, path }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  return (
    <Link to={path}>
      <li
        className={`flex items-center p-3 my-1 rounded-md cursor-pointer transition-colors duration-200 group relative ${
          isActive
            ? 'bg-[#387B66]/20 text-white'
            : 'text-gray-400 hover:bg-[#387B66]/10 hover:text-white'
        }`}
      >
        {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-[#387B66] rounded-r-full"></div>}
        <div className="w-6 h-6">{icon}</div>
        <span className="ml-4 font-semibold">{page}</span>
      </li>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const pages: { page: Page; icon: React.ReactNode; path: string }[] = [
    { page: Page.OVERVIEW, icon: <OverviewIcon />, path: '/' },
    { page: Page.TOURNAMENTS, icon: <TournamentIcon />, path: '/tournaments' },
    { page: Page.ANALYTICS, icon: <AnalyticsIcon />, path: '/analytics' },
    { page: Page.APPLICATIONS, icon: <ApplicationIcon />, path: '/applications' },
    { page: Page.LIVE, icon: <LiveIcon />, path: '/live' },
    { page: Page.REPORTS, icon: <ReportIcon />, path: '/reports' },
    { page: Page.SETTINGS, icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-[#1E1E1E] p-5 flex-shrink-0 flex flex-col shadow-lg border-r border-white/10">
      <div className="flex items-center mb-10">
        <LogoIcon />
        <h1 className="text-2xl font-bold text-white ml-2">viewer.gg</h1>
      </div>
      <nav>
        <ul>
          {pages.map(({ page, icon, path }) => (
            <NavItem
              key={page}
              page={page}
              icon={icon}
              path={path}
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-3 bg-black/20 rounded-lg text-center border border-white/10">
          <p className="text-sm text-gray-400">© 2024 viewer.gg</p>
          <p className="text-xs text-gray-500">Co-streaming Management</p>
      </div>
    </aside>
  );
};

export default Sidebar;