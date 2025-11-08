import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ad, AdCategory, AppView, BankAccount, Friend, ReportReason, ToastMessage, Transaction, TransactionStatus, TransactionType, User, UserRole, AdStatus, Conversation, Message } from './types';
import * as api from './services/api';
// Fix: Changed to a named import as the 'Header' component does not have a default export.
import { Header } from './components/Header';
import Dashboard from './components/Dashboard';
import CategoryFilter from './components/CategoryFilter';
import AdList from './components/AdList';
import AdViewerModal from './components/AdViewerModal';
import UploadAdModal from './components/UploadAdModal';
import AccountModal from './components/AccountModal';
import LoginScreen from './components/LoginScreen';
import AdDetail from './components/AdDetail';
import MyAds from './components/MyAds';
import BottomNavBar from './components/BottomNavBar';
import CartModal from './components/CartModal';
import ToastNotification from './components/ToastNotification';
import LeaderboardModal from './components/LeaderboardModal';
import AIStudioModal from './components/AIStudioModal';
import FriendsModal from './components/FriendsModal';
import ReportAdModal from './components/ReportAdModal';
import AdminPanel from './components/AdminPanel';
import { getDistance } from './utils/helpers';

const MOCK_BANK_ACCOUNT_DATA: BankAccount = {
    accountHolderName: 'Rohan Sharma',
    accountNumber: '123456789012',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001234',
    upiId: 'rohan@oksbi'
};
const MOCK_TRANSACTIONS_DATA: Transaction[] = [
    { id: 'tx-1', date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Reward: Big Diwali Sale', amount: 1.75 * 0.8, type: TransactionType.EARNED, status: TransactionStatus.COMPLETED },
    { id: 'tx-2', date: new Date(Date.now() - 86400000).toISOString(), description: 'Reward: Dhoni: A Tribute', amount: 2.50 * 0.8, type: TransactionType.EARNED, status: TransactionStatus.COMPLETED },
];
const MOCK_FRIENDS_DATA: Friend[] = [
    { id: 'user-456', name: 'Priya Patel', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-456', isOnline: true },
    { id: 'user-789', name: 'Amit Kumar', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-789', isOnline: false },
    { id: 'user-101', name: 'Sunita Devi', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-101', isOnline: true },
];

const MOCK_HISTORICAL_REVENUE = [
    { date: '7 days ago', revenue: 120 },
    { date: '6 days ago', revenue: 150 },
    { date: '5 days ago', revenue: 210 },
    { date: '4 days ago', revenue: 180 },
    { date: '3 days ago', revenue: 250 },
    { date: '2 days ago', revenue: 220 },
    { date: 'Yesterday', revenue: 300 },
];

const MOCK_CONVERSATIONS_DATA: Conversation[] = [
    {
        contactId: 'user-456',
        messages: [
            { id: 'msg-1', senderId: 'user-123', text: 'Hey Priya! Did you see the new Dhoni tribute ad?', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: true },
            { id: 'msg-2', senderId: 'user-456', text: 'Oh yes! It was amazing. So nostalgic.', timestamp: new Date(Date.now() - 3540000).toISOString(), isRead: true },
        ],
    },
    {
        contactId: 'user-789',
        messages: [
            { id: 'msg-3', senderId: 'user-789', text: 'The Diwali sale ad is everywhere!', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
        ],
    },
];

const App: React.FC = () => {
    // --- AUTH & USER ---
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in for dev
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // --- APP STATE ---
    const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // --- ADS ---
    const [ads, setAds] = useState<Ad[]>([]);
    const [currentAd, setCurrentAd] = useState<Ad | null>(null);
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [watchedAdIds, setWatchedAdIds] = useState<Set<string>>(new Set(MOCK_TRANSACTIONS_DATA.map(tx => tx.description.includes('Dhoni') ? 'ad-001' : 'ad-002')));

    // --- FILTERS & SEARCH ---
    const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState({
        location: { country: 'ALL', state: 'ALL', district: 'ALL' },
        reward: { min: '', max: '' },
        duration: { min: '', max: '' },
    });
    
    // --- WALLET & TRANSACTIONS ---
    const [balance, setBalance] = useState(MOCK_TRANSACTIONS_DATA.reduce((sum, tx) => sum + (tx.type === TransactionType.EARNED ? tx.amount : 0), 0));
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS_DATA);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(MOCK_BANK_ACCOUNT_DATA);
    const [platformRevenue, setPlatformRevenue] = useState((1.75 + 2.50) * 0.2);

    // --- WATCHLIST (CART) ---
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [isCartAnimating, setIsCartAnimating] = useState(false);

    // --- MODALS ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [adToEdit, setAdToEdit] = useState<Ad | null>(null);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
    const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
    const [adToReport, setAdToReport] = useState<Ad | null>(null);

    // --- TOASTS ---
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    let toastIdCounter = 0;

    // --- CHAT ---
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS_DATA);

    // --- DATA FETCHING & DERIVED STATE ---
    useEffect(() => {
        // Mock user fetching
        api.fetchAllUsers().then(users => {
            setAllUsers(users);
            setUser(users.find(u => u.id === 'user-123') || users[0]);
        });

        // Ad fetching
        api.fetchAds().then(fetchedAds => {
            setAds(fetchedAds);
            setIsLoading(false);
        });
    }, []);

    const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
        const newToast: ToastMessage = { id: toastIdCounter++, message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 3000);
    }, []);

    const handleCompleteAd = useCallback((adId: string, reward: number, rating?: number) => {
        const ad = ads.find(a => a.id === adId);
        if (ad && !watchedAdIds.has(adId)) {
            const userShare = reward * 0.8;
            const platformShare = reward * 0.2;

            setBalance(prev => prev + userShare);
            setPlatformRevenue(prev => prev + platformShare);
            setWatchedAdIds(prev => new Set(prev).add(adId));

            const newTransaction: Transaction = {
                id: `tx-${Date.now()}`,
                date: new Date().toISOString(),
                description: `Reward: ${ad.title}`,
                amount: userShare,
                type: TransactionType.EARNED,
                status: TransactionStatus.COMPLETED,
            };
            setTransactions(prev => [newTransaction, ...prev]);
            
            if (rating) {
                // Logic to save feedback if provided
                // This is a placeholder for now
                console.log(`Ad ${adId} rated ${rating} stars.`);
            }

            addToast(`+₹${userShare.toFixed(2)} added to your balance!`, 'success');
        }
        setCurrentAd(null);
    }, [ads, watchedAdIds, addToast]);
    
     const filteredAds = useMemo(() => {
        return ads
            .filter(ad => ad.status === AdStatus.APPROVED)
            .filter(ad => selectedCategory === 'ALL' || ad.category === selectedCategory)
            .filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || ad.description.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(ad => {
                const { location, reward, duration } = advancedFilters;
                if (location.country !== 'ALL' && ad.country !== location.country) return false;
                if (location.state !== 'ALL' && ad.state !== location.state) return false;
                if (location.district !== 'ALL' && ad.district !== location.district) return false;
                if (reward.min && ad.reward < parseFloat(reward.min)) return false;
                if (reward.max && ad.reward > parseFloat(reward.max)) return false;
                if (duration.min && ad.duration < parseFloat(duration.min)) return false;
                if (duration.max && ad.duration > parseFloat(duration.max)) return false;
                return true;
            })
            .filter(ad => {
                if (!userLocation || !ad.lat || !ad.lng) return true;
                const distance = getDistance(userLocation.lat, userLocation.lng, ad.lat, ad.lng);
                return distance <= 50; // 50km radius
            });
    }, [ads, selectedCategory, searchQuery, advancedFilters, userLocation]);

    const userAds = useMemo(() => {
        if (!user) return [];
        return ads.filter(ad => ad.uploaderId === user.id);
    }, [ads, user]);

    const watchlistAds = useMemo(() => {
        return ads.filter(ad => watchlist.includes(ad.id));
    }, [ads, watchlist]);
    
    // --- HANDLERS ---
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null);
    };

    const handleUserRoleChangeApp = (role: UserRole) => {
        if (user) {
            setUser({ ...user, role });
            setCurrentView(AppView.HOME); // Reset view on role change
        }
    };
    
    const handleSaveAd = (adData: Omit<Ad, 'id' | 'rating' | 'ratingCount' | 'uploaderId' | 'uploaderName'>) => {
        if (!user) return;
        
        setIsLoading(true);

        setTimeout(() => { // Simulate API call
            if(adToEdit) {
                 setAds(prev => prev.map(ad => ad.id === adToEdit.id ? { ...ad, ...adData, status: user.role === UserRole.APP_OWNER ? AdStatus.APPROVED : AdStatus.PENDING } : ad));
                 addToast('Ad updated successfully!', 'success');
            } else {
                 const newAd: Ad = {
                    ...adData,
                    id: `ad-${Date.now()}`,
                    rating: 0,
                    ratingCount: 0,
                    uploaderId: user.id,
                    uploaderName: user.name,
                    status: user.role === UserRole.APP_OWNER ? AdStatus.APPROVED : AdStatus.PENDING,
                };
                setAds(prev => [newAd, ...prev]);
                addToast('Ad submitted for review!', 'success');
            }
            setIsLoading(false);
            setIsUploadModalOpen(false);
            setAdToEdit(null);
        }, 1500);
    };

    const handleEditAd = (ad: Ad) => {
        setAdToEdit(ad);
        setIsUploadModalOpen(true);
    };

    const handleDeleteAds = (adIds: string[]) => {
        setAds(prev => prev.filter(ad => !adIds.includes(ad.id)));
        addToast(`${adIds.length} ad(s) deleted.`, 'info');
    };

    const handleToggleWatchlist = (adId: string) => {
        setWatchlist(prev => {
            if (prev.includes(adId)) {
                return prev.filter(id => id !== adId);
            } else {
                setIsCartAnimating(true);
                setTimeout(() => setIsCartAnimating(false), 500);
                addToast('Added to watchlist!', 'success');
                return [...prev, adId];
            }
        });
    };
    
    const handleReportAd = (ad: Ad) => {
        setAdToReport(ad);
    };

    const handleReportSubmit = (adId: string, reason: ReportReason, details?: string) => {
        console.log(`Reporting ad ${adId} for ${reason}: ${details}`);
        setAdToReport(null);
        addToast('Ad reported. Thank you for your feedback.', 'success');
    };

    // --- Admin Handlers ---
    const handleAdStatusChange = (adId: string, status: AdStatus, reason?: string) => {
        setAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status, rejectionReason: reason } : ad));
    };

    const handleUserRoleChange = (userId: string, role: UserRole) => {
         setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    };

    const handleDeleteUser = (userToDelete: User) => {
        api.deleteUser(userToDelete.id).then(res => {
            if (res.success) {
                setAllUsers(prev => prev.filter(u => u.id !== userToDelete.id));
                addToast(`User ${userToDelete.name} has been deleted.`, 'success');
            } else {
                addToast(`Failed to delete user.`, 'error');
            }
        });
    };
    
    const handlePreviewAd = (ad: Ad) => {
        setCurrentAd(ad);
    };

    // --- Chat Handlers ---
    const handleSendMessage = (contactId: string, messageText: string) => {
        if (!user) return;
        
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: user.id,
            text: messageText,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        
        setConversations(prev => {
            const convoIndex = prev.findIndex(c => c.contactId === contactId);
            if(convoIndex > -1) {
                const newConvos = [...prev];
                newConvos[convoIndex].messages.push(newMessage);
                return newConvos;
            } else {
                return [...prev, { contactId, messages: [newMessage] }];
            }
        });
    };
    
    const handleMarkAsRead = (contactId: string) => {
        setConversations(prev => {
            return prev.map(convo => {
                if (convo.contactId === contactId) {
                    return {
                        ...convo,
                        messages: convo.messages.map(msg => ({ ...msg, isRead: true })),
                    };
                }
                return convo;
            });
        });
    };

    if (!isLoggedIn) {
        return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
    }
    
    if (!user) {
        return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950"><p>Loading...</p></div>
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header 
                userRole={user.role}
                onUserRoleChange={handleUserRoleChangeApp}
                onUploadClick={() => { setAdToEdit(null); setIsUploadModalOpen(true); }}
                onLogout={handleLogout}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAiStudioClick={() => setIsAIStudioOpen(true)}
            />
            
            <main className="container mx-auto px-4 py-8 pb-24">
                {user.role === UserRole.APP_OWNER ? (
                    <AdminPanel
                        ads={ads}
                        users={allUsers}
                        platformRevenue={platformRevenue}
                        historicalRevenue={MOCK_HISTORICAL_REVENUE}
                        onAdStatusChange={handleAdStatusChange}
                        onDeleteAd={(adId) => handleDeleteAds([adId])}
                        onUserRoleChange={handleUserRoleChange}
                        onDeleteUser={handleDeleteUser}
                        onPreviewAd={handlePreviewAd}
                    />
                ) : (
                    // VIEWER AND UPLOADER VIEW
                    <>
                        {currentView === AppView.HOME && (
                            <>
                            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                            <AdList 
                                ads={filteredAds}
                                isLoading={isLoading}
                                onWatchAd={ad => setCurrentAd(ad)}
                                onToggleWatchlist={handleToggleWatchlist}
                                onReportAd={handleReportAd}
                                watchlist={watchlist}
                                watchedAdIds={watchedAdIds}
                                onAddToast={addToast}
                                advancedFilters={advancedFilters}
                                onApplyFilters={setAdvancedFilters}
                                userLocation={userLocation}
                                onSetUserLocation={setUserLocation}
                            />
                            </>
                        )}
                        {currentView === AppView.MY_ADS && (
                            <MyAds
                                userAds={userAds}
                                onEditAd={handleEditAd}
                                onDeleteAds={handleDeleteAds}
                                onUploadClick={() => { setAdToEdit(null); setIsUploadModalOpen(true); }}
                                onSelectAd={ad => setSelectedAd(ad)}
                                watchedAdIds={watchedAdIds}
                            />
                        )}
                    </>
                )}
            </main>

             {user.role !== UserRole.APP_OWNER && (
                <BottomNavBar 
                    onAccountClick={() => setIsAccountModalOpen(true)}
                    onFriendsClick={() => setIsFriendsModalOpen(true)}
                    onCartClick={() => setIsCartOpen(true)}
                    cartItemCount={watchlist.length}
                    isCartAnimating={isCartAnimating}
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    userRole={user.role}
                />
            )}

            {/* --- Modals --- */}
            {currentAd && (
                <AdViewerModal
                    ad={currentAd}
                    onClose={() => setCurrentAd(null)}
                    onComplete={handleCompleteAd}
                    isPreview={user.role === UserRole.APP_OWNER}
                />
            )}
            {isUploadModalOpen && (
                <UploadAdModal
                    onClose={() => { setIsUploadModalOpen(false); setAdToEdit(null); }}
                    onSave={handleSaveAd}
                    isLoading={false}
                    userRole={user.role}
                    error={null}
                    adToEdit={adToEdit}
                />
            )}
            {isAccountModalOpen && (
                <AccountModal
                    userRole={user.role}
                    balance={balance}
                    bankAccount={bankAccount}
                    transactions={transactions}
                    userProfile={user}
                    onClose={() => setIsAccountModalOpen(false)}
                    onAddFunds={() => {}}
                    onWithdraw={() => {}}
                    onSavePaymentDetails={(details) => setBankAccount(prev => ({...(prev || MOCK_BANK_ACCOUNT_DATA), ...details}))}
                    onSaveProfile={async (data, file) => {
                        console.log("Saving profile", data, file);
                        if(user) setUser({...user, ...data});
                        addToast("Profile updated successfully!", "success");
                    }}
                />
            )}
            {selectedAd && <AdDetail ad={selectedAd} onClose={() => setSelectedAd(null)} onReportAd={handleReportAd} userRole={user.role} />}
            {isCartOpen && <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} watchlist={watchlistAds} onWatchAd={(ad) => { setIsCartOpen(false); setCurrentAd(ad); }} onRemoveFromWatchlist={(adId) => setWatchlist(prev => prev.filter(id => id !== adId))} />}
            {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}
            {isAIStudioOpen && <AIStudioModal onClose={() => setIsAIStudioOpen(false)} />}
            {isFriendsModalOpen && <FriendsModal friends={MOCK_FRIENDS_DATA} onClose={() => setIsFriendsModalOpen(false)} onAddToast={addToast} currentUser={user} conversations={conversations} onSendMessage={handleSendMessage} onMarkAsRead={handleMarkAsRead} />}
            {adToReport && <ReportAdModal ad={adToReport} onClose={() => setAdToReport(null)} onSubmit={handleReportSubmit} />}


             {/* Toast Container */}
            <div aria-live="assertive" className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-[100]">
                <div className="w-full max-w-sm space-y-2">
                {toasts.map(toast => (
                    <ToastNotification
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToasts(currentToasts => currentToasts.filter(t => t.id !== toast.id))}
                    />
                ))}
                </div>
            </div>
        </div>
    );
}

export default App;