import React, { ReactNode } from 'react';
import { UserRole } from '../types';
import { EarningsIcon, AdsWatchedIcon, PotentialIcon, RevenueIcon, AdCountIcon } from './icons/DashboardIcons';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    color: string;
    description?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, description }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex-1 min-w-[280px] transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
        <div className="flex items-start justify-between">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">{value}</p>
                 {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

interface DashboardProps {
  userRole: UserRole;
  platformRevenue: number;
  totalAdCount: number;
  totalAdValue: number;
}

const Dashboard: React.FC<DashboardProps> = ({
  userRole,
  platformRevenue,
  totalAdCount,
  totalAdValue,
}) => {
  if (userRole === UserRole.APP_OWNER) {
    return (
       <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Platform Revenue"
          value={`₹${platformRevenue.toFixed(2)}`}
          icon={<RevenueIcon />}
          color="bg-emerald-500/20 text-emerald-500 dark:text-emerald-400"
          description="Total earnings from ad fees"
        />
        <DashboardCard
          title="Total Ads"
          value={totalAdCount}
          icon={<AdCountIcon />}
          color="bg-sky-500/20 text-sky-500 dark:text-sky-400"
          description="Number of ads on the platform"
        />
        <DashboardCard
          title="Total Ad Value"
          value={`₹${totalAdValue.toFixed(2)}`}
          icon={<EarningsIcon />}
          color="bg-purple-500/20 text-purple-500 dark:text-purple-400"
          description="Total reward value of all ads"
        />
      </div>
    );
  }

  return null;
};

export default Dashboard;