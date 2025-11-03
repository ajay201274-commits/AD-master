import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Ad, AdCategory, AppView, BankAccount, Friend, ReportReason, ToastMessage, Transaction, TransactionStatus, TransactionType, User, UserRole, AdStatus, Conversation, Message } from './types';
import * as api from './services/api';
import Header from './components/Header';
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
    { id: 'tx-1', date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Reward: Big Diwali Sale', amount: 1.75, type: TransactionType.EARNED, status: TransactionStatus.COMPLETED },
    { id: 'tx-2', date: new Date(Date.now() - 86400000).toISOString(), description: 'Reward: Dhoni: A Tribute', amount: 2.50, type: TransactionType.EARNED, status: TransactionStatus.COMPLETED },
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
        contactId: 'user-456', // Priya Patel
        messages: [
            { id: 'msg-1', senderId: 'user-456', text: 'Hey, did you see the new ad about the Himalayas?', timestamp: new Date(Date.now() - 86400000 * 1.1).toISOString() },
            { id: 'msg-2', senderId: 'user-123', text: 'Oh yeah, the travel one! Looks amazing. We should go sometime.', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: 'msg-3', senderId: 'user-456', text: 'Totally! Let me know when you are free.', timestamp: new Date(Date.now() - 76400000).toISOString(), isRead: false },
        ]
    },
    {
        contactId: 'user-789', // Amit Kumar
        messages: [
            { id: 'msg-4', senderId: 'user-789', text: 'Thanks for uploading that Dhoni tribute ad. It was really well made.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 'msg-5', senderId: 'user-123', text: 'Glad you liked it!', timestamp: new Date(Date.now() - 86400000 * 1.9).toISOString(), isRead: true },
        ]
    },
    {
        contactId: 'user-101', // Sunita Devi
        messages: []
    }
];


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [balance, setBalance] = useState(125.50);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [detailedAd, setDetailedAd] = useState<Ad | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [adToEdit, setAdToEdit] = useState<Ad | null>(null);
  const [reportingAd, setReportingAd] = useState<Ad | null>(null);
  
  // Filters and search
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
      location: { country: 'ALL', state: 'ALL', district: 'ALL' },
      reward: { min: '', max: '' },
      duration: { min: '', max: '' },
  });
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  
  // User specific data
  const [watchedAdIds, setWatchedAdIds] = useState<Set<string>>(new Set(['ad-002']));
  const [watchlist, setWatchlist] = useState<string[]>(['ad-003']);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Uploader/Owner state
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // App view
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  // Mocked data that would come from API
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(MOCK_BANK_ACCOUNT_DATA);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS_DATA);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS_DATA);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  // Fetch initial data on login
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      Promise.all([api.fetchAds(), api.fetchAllUsers()])
        .then(([fetchedAds, fetchedUsers]) => {
          setAds(fetchedAds);
          setAllUsers(fetchedUsers);
        })
        .catch(error => {
          console.error("Failed to load initial app data", error);
          addToast("Failed to load app data. Please refresh.", 'error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isLoggedIn]);

  // Update user profile when role or user list changes
  useEffect(() => {
    if (isLoggedIn && allUsers.length > 0) {
      const profile = allUsers.find(u => u.role === userRole) || allUsers.find(u => u.id === 'user-123') || allUsers[0];
      setUserProfile(profile);
    }
  }, [isLoggedIn, userRole, allUsers]);

  // Update user-specific ads when the main ad list or the user profile changes
  useEffect(() => {
    if (userProfile) {
      setUserAds(ads.filter(ad => ad.uploaderId === userProfile.id));
    }
  }, [ads, userProfile]);

  const adsForViewer = useMemo(() => ads.filter(ad => ad.status === AdStatus.APPROVED), [ads]);

  const filteredAds = useMemo(() => {
    let newFilteredAds = [...adsForViewer];

    // 1. Category filter
    if (selectedCategory !== 'ALL') {
        newFilteredAds = newFilteredAds.filter(ad => ad.category === selectedCategory);
    }
    // 2. Search query filter
    if (searchQuery) {
        newFilteredAds = newFilteredAds.filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // 3. Advanced filters from modal
    if (advancedFilters.location.country !== 'ALL') {
        newFilteredAds = newFilteredAds.filter(ad => ad.country === advancedFilters.location.country);
        if (advancedFilters.location.state !== 'ALL') {
            newFilteredAds = newFilteredAds.filter(ad => ad.state === advancedFilters.location.state);
            if (advancedFilters.location.district !== 'ALL') {
                newFilteredAds = newFilteredAds.filter(ad => ad.district === advancedFilters.location.district);
            }
        }
    }
    if(advancedFilters.reward.min) {
        newFilteredAds = newFilteredAds.filter(ad => ad.reward >= parseFloat(advancedFilters.reward.min));
    }
    if(advancedFilters.reward.max) {
        newFilteredAds = newFilteredAds.filter(ad => ad.reward <= parseFloat(advancedFilters.reward.max));
    }
    if(advancedFilters.duration.min) {
        newFilteredAds = newFilteredAds.filter(ad => ad.duration >= parseFloat(advancedFilters.duration.min));
    }
    if(advancedFilters.duration.max) {
        newFilteredAds = newFilteredAds.filter(ad => ad.duration <= parseFloat(advancedFilters.duration.max));
    }
    
    // 4. Geolocation filter
    if (userLocation) {
        newFilteredAds = newFilteredAds.filter(ad => {
            if (ad.lat && ad.lng) {
                const distance = getDistance(userLocation.lat, userLocation.lng, ad.lat, ad.lng);
                return distance < 50; // 50km radius
            }
            return false;
        });
    }
    return newFilteredAds;
  }, [adsForViewer, selectedCategory, searchQuery, advancedFilters, userLocation]);

  const handleSaveRatingAndCompleteAd = (adId: string, reward: number, rating?: number) => {
    // Update balance and watched status
    setBalance(prev => prev + reward);
    setWatchedAdIds(prev => new Set(prev).add(adId));
    setSelectedAd(null);
    setDetailedAd(null);
    
    let toastMessage = `+₹${reward.toFixed(2)} claimed!`;
    if (rating && rating > 0) {
        toastMessage += ` Thanks for your rating.`;
        // Update ad's average rating
        setAds(prevAds => prevAds.map(ad => {
            if (ad.id === adId) {
                const currentRating = ad.rating || 0;
                const currentRatingCount = ad.ratingCount || 0;
                const newRatingCount = currentRatingCount + 1;
                const newAverageRating = ((currentRating * currentRatingCount) + rating) / newRatingCount;
                return { 
                    ...ad, 
                    rating: newAverageRating,
                    ratingCount: newRatingCount 
                };
            }
            return ad;
        }));
    }
    addToast(toastMessage, 'success');
  };

  const handleSaveAd = (adData: Omit<Ad, 'id' | 'rating' | 'ratingCount' | 'uploaderId' | 'uploaderName'>) => {
    setIsUploadModalOpen(false);
    
    if (adToEdit) {
        // Edit logic
        const updatedAd: Ad = { ...adToEdit, ...adData, status: AdStatus.PENDING };
        delete updatedAd.rejectionReason; // Clear reason on re-submission
        setAds(prev => prev.map(ad => ad.id === adToEdit.id ? updatedAd : ad));
        setAdToEdit(null);
        addToast(`Ad "${adData.title}" updated and sent for approval.`, 'success');

    } else {
        // Add logic
        const newAd: Ad = { ...adData, id: `ad-${Date.now()}`, rating: 0, ratingCount: 0, uploaderId: userProfile!.id, uploaderName: userProfile!.name, status: AdStatus.PENDING };
        setAds(prev => [newAd, ...prev]);
        addToast(`Ad "${adData.title}" submitted for approval!`, 'success');
    }
  };

  const handleEditAd = (ad: Ad) => {
    setAdToEdit(ad);
    setIsUploadModalOpen(true);
  };
  
  const handleDeleteAds = (adIds: string[]) => {
      setAds(prev => prev.filter(ad => !adIds.includes(ad.id)));
      addToast(`${adIds.length} ad(s) deleted.`, 'info');
  };
  
  const handleToggleWatchlist = useCallback((adId: string) => {
    setWatchlist(prev => {
        const isInWatchlist = prev.includes(adId);
        if (isInWatchlist) {
            return prev.filter(id => id !== adId);
        } else {
            setIsCartAnimating(true);
            setTimeout(() => setIsCartAnimating(false), 500); // Animation duration
            return [...prev, adId];
        }
    });
  }, []);

  const handleUserRoleChange = (role: UserRole) => {
    setUserRole(role);
    setCurrentView(AppView.HOME); // Reset view on role change
  };

  const handleOpenReportModal = (ad: Ad) => {
    setReportingAd(ad);
  };

  const handleSubmitReport = (adId: string, reason: ReportReason, details?: string) => {
    console.log(`Reporting ad ${adId} for: ${reason}. Details: ${details || 'N/A'}`);
    setReportingAd(null);
    addToast('Ad reported successfully. Thank you!', 'info');
  };

  // --- Chat Handlers ---
  const handleSendMessage = (contactId: string, messageText: string) => {
    if (!userProfile) return;

    const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: userProfile.id,
        text: messageText,
        timestamp: new Date().toISOString(),
        isRead: true,
    };

    setConversations(prevConvos => {
        const newConvos = [...prevConvos];
        const convoIndex = newConvos.findIndex(c => c.contactId === contactId);

        if (convoIndex > -1) {
            newConvos[convoIndex].messages.push(newMessage);
        } else {
            newConvos.push({ contactId: contactId, messages: [newMessage] });
        }
        return newConvos;
    });

    // Simulate reply
    setTimeout(() => {
        const replyMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            senderId: contactId,
            text: `Thanks for your message! I'll get back to you soon.`,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setConversations(prevConvos => {
            const newConvos = [...prevConvos];
            const convoIndex = newConvos.findIndex(c => c.contactId === contactId);
            if (convoIndex > -1) {
                newConvos[convoIndex].messages.push(replyMessage);
            }
            return newConvos;
        });
    }, 1500);
  };

  const handleMarkAsRead = (contactId: string) => {
    setConversations(prevConvos => 
        prevConvos.map(convo => {
            if (convo.contactId === contactId) {
                return {
                    ...convo,
                    messages: convo.messages.map(msg => 
                        msg.senderId === contactId ? { ...msg, isRead: true } : msg
                    )
                };
            }
            return convo;
        })
    );
  };

  // --- Admin Handlers ---
  const handleAdStatusChange = (adId: string, status: AdStatus, reason?: string) => {
      setAds(prevAds => prevAds.map(ad => {
        if (ad.id === adId) {
            const updatedAd: Ad = { ...ad, status };
            if (status === AdStatus.REJECTED) {
                updatedAd.rejectionReason = reason;
            } else {
                delete updatedAd.rejectionReason;
            }
            return updatedAd;
        }
        return ad;
    }));
      addToast(`Ad status updated to ${status}.`, 'info');
  };

  const handleAdminDeleteAd = (adId: string) => {
      setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      addToast(`Ad has been permanently deleted.`, 'info');
  };

  const handleAdminUserRoleChange = (userId: string, role: UserRole) => {
      setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role } : u));
      addToast(`User role updated.`, 'info');
  }

  const handleAdminDeleteUser = async (user: User) => {
    if(!user) return;
    const { success } = await api.deleteUser(user.id);
    if(success) {
      setAllUsers(prev => prev.filter(u => u.id !== user.id));
      addToast(`User "${user.name}" has been deleted.`, 'info');
    } else {
      addToast(`Failed to delete user.`, 'error');
    }
  }


  if (!isLoggedIn) {
      return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }
  
  const totalAdValue = ads.reduce((sum, ad) => sum + ad.reward, 0);
  const platformRevenue = totalAdValue * 0.1; // Mock 10% commission

  const renderCurrentView = () => {
    if (userRole === UserRole.APP_OWNER) {
        return <AdminPanel
            ads={ads}
            users={allUsers}
            platformRevenue={platformRevenue}
            historicalRevenue={MOCK_HISTORICAL_REVENUE}
            onAdStatusChange={handleAdStatusChange}
            onDeleteAd={handleAdminDeleteAd}
            onUserRoleChange={handleAdminUserRoleChange}
            onDeleteUser={handleAdminDeleteUser}
            onPreviewAd={setDetailedAd}
        />
    }

    switch(currentView) {
        case AppView.HOME:
            return <AdList
                ads={filteredAds}
                isLoading={isLoading}
                onWatchAd={(ad) => setSelectedAd(ad)}
                onToggleWatchlist={handleToggleWatchlist}
                onReportAd={handleOpenReportModal}
                watchlist={watchlist}
                watchedAdIds={watchedAdIds}
                onAddToast={addToast}
                advancedFilters={advancedFilters}
                onApplyFilters={setAdvancedFilters}
                userLocation={userLocation}
                onSetUserLocation={setUserLocation}
            />;
        case AppView.MY_ADS:
            return <MyAds 
                userAds={userAds} 
                onEditAd={handleEditAd} 
                onDeleteAds={handleDeleteAds}
                onUploadClick={() => setIsUploadModalOpen(true)}
                onSelectAd={setDetailedAd}
                watchedAdIds={watchedAdIds}
            />
        default:
            return null;
    }
  }

  const watchlistAds = ads.filter(ad => watchlist.includes(ad.id));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-800 dark:text-slate-200 transition-colors">
        <Header 
            userRole={userRole} 
            onUserRoleChange={handleUserRoleChange}
            onUploadClick={() => setIsUploadModalOpen(true)}
            onLogout={() => setIsLoggedIn(false)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAiStudioClick={() => setIsAiStudioOpen(true)}
        />
        
        <main className="container mx-auto p-4 pb-24">
            {userRole === UserRole.APP_OWNER && <Dashboard 
                userRole={userRole}
                platformRevenue={platformRevenue}
                totalAdCount={ads.length}
                totalAdValue={totalAdValue}
            />}
            {userRole !== UserRole.APP_OWNER && currentView === AppView.HOME && <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />}
            {renderCurrentView()}
        </main>
        
        {userRole !== UserRole.APP_OWNER && <BottomNavBar 
            onAccountClick={() => setIsAccountModalOpen(true)}
            onFriendsClick={() => setIsFriendsOpen(true)}
            onCartClick={() => setIsCartOpen(true)}
            cartItemCount={watchlist.length}
            isCartAnimating={isCartAnimating}
            currentView={currentView}
            onNavigate={setCurrentView}
            userRole={userRole}
        />}

        {/* Modals */}
        {selectedAd && <AdViewerModal ad={selectedAd} onClose={() => setSelectedAd(null)} onComplete={handleSaveRatingAndCompleteAd} />}
        {detailedAd && <AdDetail ad={detailedAd} onClose={() => setDetailedAd(null)} userRole={userRole} onReportAd={handleOpenReportModal} />}
        {isUploadModalOpen && <UploadAdModal onClose={() => {setIsUploadModalOpen(false); setAdToEdit(null)}} onSave={handleSaveAd} isLoading={false} userRole={userRole} error={null} adToEdit={adToEdit} />}
        {isAccountModalOpen && userProfile && <AccountModal userRole={userRole} balance={balance} bankAccount={bankAccount} transactions={transactions} userProfile={userProfile} onClose={() => setIsAccountModalOpen(false)} onAddFunds={(amount) => setBalance(b => b + amount)} onWithdraw={(amount) => setBalance(b => b - amount)} onSavePaymentDetails={(details) => setBankAccount(p => ({...p, ...details} as BankAccount))} onSaveProfile={async () => {}} />}
        {isCartOpen && <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} watchlist={watchlistAds} onWatchAd={(ad) => {setIsCartOpen(false); setSelectedAd(ad)}} onRemoveFromWatchlist={handleToggleWatchlist} />}
        {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}
        {isAiStudioOpen && <AIStudioModal onClose={() => setIsAiStudioOpen(false)} />}
        {isFriendsOpen && userProfile && <FriendsModal friends={MOCK_FRIENDS_DATA} onClose={() => setIsFriendsOpen(false)} onAddToast={addToast} currentUser={userProfile} conversations={conversations} onSendMessage={handleSendMessage} onMarkAsRead={handleMarkAsRead} />}
        {reportingAd && <ReportAdModal ad={reportingAd} onClose={() => setReportingAd(null)} onSubmit={handleSubmitReport} />}
        
        {/* Toasts */}
        <div className="fixed bottom-24 w-full flex flex-col items-center space-y-2 z-50 pointer-events-none">
            {toasts.map(toast => (
                <ToastNotification key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
            ))}
        </div>
    </div>
  );
}

export default App;