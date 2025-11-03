import React, { useState, useMemo, useCallback } from 'react';
import { Ad, AdStatus, User, UserRole } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { RevenueIcon, AdCountIcon } from './icons/DashboardIcons';
import RevenueChart from './RevenueChart';

// --- Helper Icons (defined locally as new files cannot be created) ---
const UsersIcon: React.FC<{className?: string}> = ({className="w-8 h-8"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21V5a2 2 0 00-2-2H9a2 2 0 00-2 2v16" />
    </svg>
);
const PendingIcon: React.FC<{className?: string}> = ({className="w-8 h-8"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const CheckIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
);
const XIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
const TrashIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const EyeIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);

const RejectionReasonModal: React.FC<{
    ad: Ad;
    onClose: () => void;
    onSubmit: (reason: string) => void;
}> = ({ ad, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
        }
    };
    
    const animationClasses = isClosing ? 'opacity-0 scale-95 -translate-y-10' : 'opacity-100 scale-100 translate-y-0';

    return (
        <div
            className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
            style={{ opacity: isClosing ? 0 : 1 }}
            onClick={handleClose}
        >
            <div
                className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out ${animationClasses}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reason for Rejection</h3>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Please provide a reason for rejecting the ad: <span className="font-semibold text-slate-800 dark:text-white">"{ad.title}"</span>.</p>
                    <textarea 
                        value={reason} 
                        onChange={e => setReason(e.target.value)} 
                        rows={4} 
                        className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500"
                        placeholder="e.g., Image is low quality, content is inappropriate..."
                        autoFocus
                    />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 flex justify-end items-center space-x-3 rounded-b-xl">
                    <button onClick={handleClose} className="py-2 px-4 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} disabled={!reason.trim()} className="py-2 px-4 bg-red-600 text-white font-bold rounded-lg disabled:opacity-50 hover:bg-red-500">Confirm Rejection</button>
                </div>
            </div>
        </div>
    );
};


interface AdminPanelProps {
    ads: Ad[];
    users: User[];
    platformRevenue: number;
    historicalRevenue: { date: string, revenue: number }[];
    onAdStatusChange: (adId: string, status: AdStatus, reason?: string) => void;
    onDeleteAd: (adId: string) => void;
    onUserRoleChange: (userId: string, role: UserRole) => void;
    onDeleteUser: (user: User) => void;
    onPreviewAd: (ad: Ad) => void;
}

type AdminTab = 'dashboard' | 'pending' | 'allAds' | 'users';

const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
                Previous
            </button>
            <span className="text-sm text-slate-700 dark:text-slate-300">
                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
                Next
            </button>
        </div>
    );
};

const StatusBadge: React.FC<{ status: AdStatus }> = ({ status }) => {
    const styles = {
        [AdStatus.PENDING]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        [AdStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [AdStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        </div>
    </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; onClick: () => void; className?: string; tooltip: string }> = ({ icon, onClick, className = '', tooltip }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 ${className}`}
        title={tooltip}
    >
        {icon}
    </button>
);

const TabButton: React.FC<{ label: string; count?: number; isActive: boolean; onClick: () => void; }> = ({ label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 py-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            isActive
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
    >
        <span>{label}</span>
        {count !== undefined && count > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                {count}
            </span>
        )}
    </button>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ ads, users, platformRevenue, historicalRevenue, onAdStatusChange, onDeleteAd, onUserRoleChange, onDeleteUser, onPreviewAd }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [adToDelete, setAdToDelete] = useState<Ad | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [adToReject, setAdToReject] = useState<Ad | null>(null);
    const [updatedUserId, setUpdatedUserId] = useState<string | null>(null);
    const [adsPage, setAdsPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const pendingAds = useMemo(() => ads.filter(ad => ad.status === AdStatus.PENDING), [ads]);

    const chartData = useMemo(() => ({
        labels: historicalRevenue.map(d => d.date),
        values: historicalRevenue.map(d => d.revenue),
    }), [historicalRevenue]);

    const handleTabClick = (tab: AdminTab) => {
        setActiveTab(tab);
        setAdsPage(1);
        setUsersPage(1);
    };

    const handleConfirmAdDelete = () => {
        if (adToDelete) {
            onDeleteAd(adToDelete.id);
            setAdToDelete(null);
        }
    };
    
    const handleConfirmUserDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete);
            setUserToDelete(null);
        }
    };

    const handleConfirmRejection = (reason: string) => {
        if (adToReject) {
            onAdStatusChange(adToReject.id, AdStatus.REJECTED, reason);
            setAdToReject(null);
        }
    };

    const handleRoleChange = (userId: string, role: UserRole) => {
        onUserRoleChange(userId, role);
        setUpdatedUserId(userId);
        setTimeout(() => {
            setUpdatedUserId(null);
        }, 1500); // Highlight duration
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Platform Revenue" value={`₹${platformRevenue.toFixed(2)}`} icon={<RevenueIcon />} color="bg-emerald-500/20 text-emerald-500 dark:text-emerald-400" />
                <StatCard title="Total Ads" value={ads.length} icon={<AdCountIcon />} color="bg-sky-500/20 text-sky-500 dark:text-sky-400" />
                <StatCard title="Total Users" value={users.length} icon={<UsersIcon />} color="bg-purple-500/20 text-purple-500 dark:text-purple-400" />
                <StatCard title="Pending Ads" value={pendingAds.length} icon={<PendingIcon />} color="bg-amber-500/20 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Revenue (Last 7 Days)
                </h3>
                <div className="h-72">
                    <RevenueChart data={chartData} />
                </div>
            </div>
        </div>
    );

    const renderAdsTable = (adsToRender: Ad[]) => {
        const totalPages = Math.ceil(adsToRender.length / ITEMS_PER_PAGE);
        const paginatedAds = adsToRender.slice((adsPage - 1) * ITEMS_PER_PAGE, adsPage * ITEMS_PER_PAGE);

        return (
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ad</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploader</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {paginatedAds.map(ad => (
                                <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <img src={ad.thumbnailUrl} alt={ad.title} className="w-16 h-9 object-cover rounded" />
                                            <div>
                                                <div className="font-semibold">{ad.title}</div>
                                                <div className="text-xs text-slate-500">{ad.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-sm">{ad.uploaderName}</td>
                                    <td className="p-4 whitespace-nowrap text-sm">
                                        <div><span className="font-semibold">Reward:</span> ₹{ad.reward.toFixed(2)}</div>
                                        <div><span className="font-semibold">Type:</span> {ad.category}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <StatusBadge status={ad.status} />
                                        {ad.status === AdStatus.REJECTED && ad.rejectionReason && (
                                            <p className="text-xs text-red-500 dark:text-red-400 mt-1 italic max-w-[150px] truncate" title={ad.rejectionReason}>
                                                Reason: {ad.rejectionReason}
                                            </p>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <ActionButton icon={<EyeIcon />} onClick={() => onPreviewAd(ad)} tooltip="Preview Ad" />
                                            {ad.status === AdStatus.PENDING && <>
                                                <ActionButton icon={<CheckIcon/>} onClick={() => onAdStatusChange(ad.id, AdStatus.APPROVED)} className="text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50" tooltip="Approve" />
                                                <ActionButton icon={<XIcon />} onClick={() => setAdToReject(ad)} className="text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50" tooltip="Reject" />
                                            </>}
                                            <ActionButton icon={<TrashIcon />} onClick={() => setAdToDelete(ad)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" tooltip="Delete" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={adsPage}
                        totalPages={totalPages}
                        onPageChange={setAdsPage}
                    />
                )}
            </div>
        );
    }

    const renderUsersTable = () => {
        const displayUsers = users.filter(u => u.role !== UserRole.APP_OWNER);
        const totalPages = Math.ceil(displayUsers.length / ITEMS_PER_PAGE);
        const paginatedUsers = displayUsers.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE);

        return (
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {paginatedUsers.map(user => (
                                <tr key={user.id} className={`transition-colors duration-1000 ${updatedUserId === user.id ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <img src={user.profilePictureUrl} alt={user.name} className="w-10 h-10 rounded-full"/>
                                            <div>
                                                <div className="font-semibold">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-sm">
                                        <div>{user.email}</div>
                                        <div className="text-xs text-slate-500">{user.phone}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="relative">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className="appearance-none bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md py-1.5 pl-3 pr-8 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                                            >
                                                <option value={UserRole.VIEWER}>Viewer</option>
                                                <option value={UserRole.UPLOADER}>Uploader</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <ActionButton icon={<TrashIcon />} onClick={() => setUserToDelete(user)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" tooltip="Delete User" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <PaginationControls
                        currentPage={usersPage}
                        totalPages={totalPages}
                        onPageChange={setUsersPage}
                    />
                )}
            </div>
        );
    }

    return (
        <section className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Admin Panel</h1>
            <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => handleTabClick('dashboard')} />
                    <TabButton label="Pending Ads" count={pendingAds.length} isActive={activeTab === 'pending'} onClick={() => handleTabClick('pending')} />
                    <TabButton label="All Ads" isActive={activeTab === 'allAds'} onClick={() => handleTabClick('allAds')} />
                    <TabButton label="Users" isActive={activeTab === 'users'} onClick={() => handleTabClick('users')} />
                </nav>
            </div>
            <div>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'pending' && (pendingAds.length > 0 ? renderAdsTable(pendingAds) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">No ads are pending approval.</p>)}
                {activeTab === 'allAds' && renderAdsTable(ads)}
                {activeTab === 'users' && renderUsersTable()}
            </div>
            {adToDelete && (
                <ConfirmationModal
                    isOpen={!!adToDelete}
                    onClose={() => setAdToDelete(null)}
                    onConfirm={handleConfirmAdDelete}
                    title="Delete Ad"
                    message={`Are you sure you want to permanently delete the ad "${adToDelete.title}"? This action cannot be undone.`}
                    confirmText="Delete Ad"
                    confirmButtonClass="bg-red-600 hover:bg-red-500"
                />
            )}
            {userToDelete && (
                <ConfirmationModal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={handleConfirmUserDelete}
                    title="Delete User"
                    message={`Are you sure you want to permanently delete the user "${userToDelete.name}"? This will remove all their data.`}
                    confirmText="Delete User"
                    confirmButtonClass="bg-red-600 hover:bg-red-500"
                />
            )}
            {adToReject && (
                <RejectionReasonModal
                    ad={adToReject}
                    onClose={() => setAdToReject(null)}
                    onSubmit={handleConfirmRejection}
                />
            )}
        </section>
    );
};

export default AdminPanel;
