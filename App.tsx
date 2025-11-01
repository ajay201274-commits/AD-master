

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

// Types and Constants
import { Ad, UserRole, AdType, SortBy, User, BankAccount, Transaction, AppView, Feedback, Toast, TransactionType, AdCategory, TransactionStatus } from './types';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CategoryFilter from './components/CategoryFilter';
import AdList from './components/AdList';
import AdDetail from './components/AdDetail';
import UploadAdModal from './components/UploadAdModal';
import CartModal from './components/CartModal';
import AdViewerModal from './components/AdViewerModal';
import AccountDetailsModal from './components/AccountDetailsModal';
import LoginScreen from './components/LoginScreen';
import AIStudioModal from './components/AIStudioModal';
import BottomNavBar from './components/BottomNavBar';
import MyAds from './components/MyAds';
import ConfirmationModal from './components/ConfirmationModal';
import FeedbackModal from './components/FeedbackModal';
import SearchModal from './components/SearchModal';
import ToastNotification from './components/ToastNotification';

// API
import * as api from './services/api';

const App: React.FC = () => {
    // Auth & User State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    
    // Data State
    const [ads, setAds] = useState<Ad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    
    // UI State
    const [currentView, setCurrentView] = useState<AppView>('home');
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [adToView, setAdToView] = useState<Ad | null>(null);
    const [adToEdit, setAdToEdit] = useState<Ad | null>(null);
    const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
    const [adToReview, setAdToReview] = useState<Ad | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    
    // Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Filtering & Sorting State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<SortBy>('default');
    const [locationFilters, setLocationFilters] = useState({ country: 'ALL', state: 'ALL', district: 'ALL' });
    
    // Watchlist (Cart) State
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    
    // Toast Notification State
    const [toast, setToast] = useState<Toast | null>(null);

    // --- Effects ---
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedAds, profile, account, trans] = await Promise.all([
                api.fetchAds(),
                api.fetchUserProfile(),
                api.fetchBankAccount(),
                api.fetchTransactions(),
            ]);
            setAds(fetchedAds);
            setUserProfile(profile);
            setBankAccount(account);
            setTransactions(trans);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAllData();
            // Simulate processing pending withdrawals on app load
            api.processPendingWithdrawals().then(wasChanged => {
                if (wasChanged) fetchAllData();
            });
        }
    }, [isLoggedIn, fetchAllData]);

    useEffect(() => {
        const totalEarned = transactions
            .filter(tx => tx.type === TransactionType.EARNED && tx.status === TransactionStatus.COMPLETED)
            .reduce((acc, tx) => acc + tx.amount, 0);

        const totalWithdrawn = transactions
            .filter(tx => tx.type === TransactionType.WITHDRAWAL && tx.status === TransactionStatus.COMPLETED)
            .reduce((acc, tx) => acc + tx.amount, 0);
        
        const pendingWithdrawals = transactions
            .filter(tx => tx.type === TransactionType.WITHDRAWAL && tx.status === TransactionStatus.PENDING)
            .reduce((acc, tx) => acc + tx.amount, 0);
            
        setAvailableBalance(totalEarned - totalWithdrawn - pendingWithdrawals);
    }, [transactions]);
    
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // --- Memos ---
    const watchedAdIds = useMemo(() => {
        return new Set(transactions.filter(tx => tx.adId).map(tx => tx.adId));
    }, [transactions]);

    const filteredAndSortedAds = useMemo(() => {
        return ads
            .filter(ad => {
                const searchMatch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
                const categoryMatch = selectedCategory === 'ALL' || ad.category === selectedCategory;
                const locationMatch = 
                    (locationFilters.country === 'ALL' || !ad.country || ad.country === locationFilters.country) &&
                    (locationFilters.state === 'ALL' || !ad.state || ad.state === locationFilters.state) &&
                    (locationFilters.district === 'ALL' || !ad.district || ad.district === locationFilters.district);
                return searchMatch && categoryMatch && locationMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'reward-desc': return b.reward - a.reward;
                    case 'reward-asc': return a.reward - b.reward;
                    case 'duration-desc': return b.duration - a.duration;
                    case 'duration-asc': return a.duration - b.duration;
                    default: return 0;
                }
            });
    }, [ads, searchQuery, selectedCategory, sortBy, locationFilters]);

    const userAds = useMemo(() => ads, [ads]);

    const { adsWatchedCount, potentialEarnings } = useMemo(() => {
        const watchedCount = watchedAdIds.size;
        const potential = ads.reduce((sum, ad) => 
            !watchedAdIds.has(ad.id) ? sum + ad.reward : sum, 0
        );
        return { adsWatchedCount: watchedCount, potentialEarnings: potential };
    }, [ads, watchedAdIds]);

     const { platformRevenue, totalAdCount, totalAdValue } = useMemo(() => {
        const totalValue = ads.reduce((sum, ad) => sum + ad.reward, 0);
        const revenue = totalValue * 0.1; // 10% platform fee
        return { platformRevenue: revenue, totalAdCount: ads.length, totalAdValue: totalValue };
    }, [ads]);

    // --- Handlers ---
    const handleLoginSuccess = () => setIsLoggedIn(true);
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserRole(UserRole.VIEWER);
        setAds([]);
        setWatchlist([]);
        setSelectedAd(null);
    };

    const handleSelectAd = (ad: Ad) => {
        setSelectedAd(ad);
        setCurrentView('home'); 
    };
    
    const handleWatchAd = (ad: Ad) => {
        setAdToView(ad);
    };

    const handleAdComplete = async (adId: string, reward: number) => {
        const ad = ads.find(a => a.id === adId);
        if(!ad) return;

        const newTransaction = await api.addTransaction({
            type: TransactionType.EARNED,
            status: TransactionStatus.COMPLETED,
            description: `Watched: ${ad.title}`,
            amount: reward,
            adId: ad.id,
        });
        
        setTransactions(prev => [newTransaction, ...prev]);
        setAdToView(null);
        setToast({ message: `+₹${reward.toFixed(2)} added to your balance!`, type: 'success' });
    };

    const handleToggleWatchlist = (adId: string) => {
        const ad = ads.find(a => a.id === adId);
        if (!ad) return;

        setWatchlist(prev => {
            if (prev.includes(adId)) {
                setToast({ message: `Removed "${ad.title}" from watchlist`, type: 'info' });
                return prev.filter(id => id !== adId);
            } else {
                setIsCartAnimating(true);
                setTimeout(() => setIsCartAnimating(false), 500);
                setToast({ message: `Added "${ad.title}" to watchlist`, type: 'success' });
                return [...prev, adId];
            }
        });
    };
    
    const handleSaveAd = async (adData: Omit<Ad, 'rating'>) => {
        setIsUploading(true);
        setUploadError(null);
        try {
            const savedAd = await api.saveAd(adData);
            setAds(prev => adData.id ? prev.map(p => p.id === savedAd.id ? savedAd : p) : [savedAd, ...prev]);
            setIsUploadModalOpen(false);
            setAdToEdit(null);
        } catch (error) {
            setUploadError("Failed to save ad.");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleEditAd = (ad: Ad) => {
        setAdToEdit(ad);
        setIsUploadModalOpen(true);
    }

    const handleDeleteAds = async (adIds: string[]) => {
        try {
            await api.bulkDeleteAds(adIds);
            setAds(prev => prev.filter(p => !adIds.includes(p.id)));
        } catch (error) {
            console.error("Failed to delete ad(s)", error);
        }
    };
    
    const handleSaveBankAccount = async (account: BankAccount) => {
        await api.saveBankAccount(account);
        setBankAccount(account);
    };

    const handleWithdraw = async (amount: number) => {
        if (!bankAccount) {
            setToast({ message: "Please add a bank account first.", type: "error" });
            return;
        }
        const newTransaction = await api.addTransaction({
            type: TransactionType.WITHDRAWAL,
            status: TransactionStatus.PENDING,
            description: `Withdrawal to A/C ...${bankAccount.accountNumber.slice(-4)}`,
            amount,
            bankAccount,
        });
        setTransactions(prev => [newTransaction, ...prev]);
        setToast({ message: `Withdrawal of ₹${amount.toFixed(2)} is processing.`, type: 'info' });
        
        // Simulate background processing
        setTimeout(() => {
            api.processPendingWithdrawals().then(wasChanged => {
                if (wasChanged) {
                    api.fetchTransactions().then(setTransactions);
                    setToast({ message: `Withdrawal of ₹${amount.toFixed(2)} completed!`, type: 'success' });
                }
            });
        }, 1000);
    };
    
    const handleSaveFeedback = async (feedback: Omit<Feedback, 'id'>) => {
        try {
            await api.saveFeedback(feedback);
            setAdToReview(null);
        } catch (e) { console.error(e); }
    };

    // --- Render Logic ---
    if (!isLoggedIn) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    if (!process.env.API_KEY) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
                    <p>Google Maps API Key is missing. Please configure it to use map features.</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (selectedAd) {
            return <AdDetail 
                ad={selectedAd}
                userRole={userRole}
                userAds={userAds}
                onBack={() => setSelectedAd(null)}
                isWatched={watchedAdIds.has(selectedAd.id)}
                onWatchAd={handleWatchAd}
                onToggleWatchlist={handleToggleWatchlist}
                isInWatchlist={watchlist.includes(selectedAd.id)}
                allAds={ads}
                onSelectAd={handleSelectAd}
                onEditAd={handleEditAd}
                onDeleteAd={(id) => setItemToDeleteId(id)}
                onLeaveReview={(ad) => setAdToReview(ad)}
            />;
        }
        if (currentView === 'my-ads') {
            return <MyAds 
                userAds={userAds} 
                onEditAd={handleEditAd} 
                onDeleteAds={handleDeleteAds}
                onUploadClick={() => setIsUploadModalOpen(true)}
                onSelectAd={handleSelectAd}
                watchedAdIds={watchedAdIds}
            />;
        }

        return (
            <>
                <Dashboard 
                    userRole={userRole}
                    balance={availableBalance}
                    adsWatchedCount={adsWatchedCount}
                    potentialEarnings={potentialEarnings}
                    platformRevenue={platformRevenue}
                    totalAdCount={totalAdCount}
                    totalAdValue={totalAdValue}
                />
                <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                <AdList 
                    ads={filteredAndSortedAds} 
                    isLoading={isLoading}
                    onSelectAd={handleSelectAd}
                    onWatchAd={handleWatchAd}
                    watchedAdIds={watchedAdIds}
                    locationFilters={locationFilters}
                    onLocationChange={setLocationFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </>
        );
    };

    return (
        <APIProvider apiKey={process.env.API_KEY} libraries={['geocoding']}>
            <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
                <Header
                    userRole={userRole}
                    onUserRoleChange={setUserRole}
                    balance={availableBalance}
                    onUploadClick={() => setIsUploadModalOpen(true)}
                    onAccountClick={() => setIsAccountModalOpen(true)}
                    onLogout={handleLogout}
                />
                
                <main className="container mx-auto px-4 py-8 mb-20">
                    {renderContent()}
                </main>
                
                <BottomNavBar
                    onAccountClick={() => setIsAccountModalOpen(true)}
                    onAiStudioClick={() => setIsAiStudioOpen(true)}
                    onSearchClick={() => setIsSearchModalOpen(true)}
                    onCartClick={() => setIsCartOpen(true)}
                    cartItemCount={watchlist.length}
                    isCartAnimating={isCartAnimating}
                    currentView={currentView}
                    onNavigate={(view) => {
                        setCurrentView(view);
                        setSelectedAd(null); // Clear ad detail when navigating
                    }}
                    userRole={userRole}
                />

                {/* --- Modals --- */}
                 {isSearchModalOpen && (
                     <SearchModal
                        isOpen={isSearchModalOpen}
                        onClose={() => setIsSearchModalOpen(false)}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                     />
                )}
                {isUploadModalOpen && (
                    <UploadAdModal 
                        onClose={() => { setIsUploadModalOpen(false); setAdToEdit(null); }}
                        onSave={handleSaveAd}
                        isLoading={isUploading}
                        userRole={userRole}
                        error={uploadError}
                        adToEdit={adToEdit}
                    />
                )}
                {isCartOpen && (
                     <CartModal 
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        watchlist={ads.filter(ad => watchlist.includes(ad.id))}
                        onWatchAd={(ad) => {
                            setIsCartOpen(false);
                            handleWatchAd(ad);
                        }}
                        onRemoveFromWatchlist={handleToggleWatchlist}
                     />
                )}
                {adToView && (
                    <AdViewerModal 
                        ad={adToView}
                        onClose={() => setAdToView(null)}
                        onComplete={handleAdComplete}
                    />
                )}
                 {isAccountModalOpen && (
                     <AccountDetailsModal
                        userProfile={userProfile}
                        balance={availableBalance}
                        bankAccount={bankAccount}
                        transactions={transactions}
                        isLoading={isLoading}
                        onClose={() => setIsAccountModalOpen(false)}
                        onSaveBankAccount={handleSaveBankAccount}
                        onWithdraw={handleWithdraw}
                        userRole={userRole}
                        onUpdateProfilePicture={() => {}}
                        onUpdateUserProfile={() => {}}
                     />
                )}
                {isAiStudioOpen && <AIStudioModal onClose={() => setIsAiStudioOpen(false)} />}
                 {itemToDeleteId && (
                    <ConfirmationModal
                        isOpen={!!itemToDeleteId}
                        onClose={() => setItemToDeleteId(null)}
                        onConfirm={() => {
                            handleDeleteAds([itemToDeleteId]);
                            setItemToDeleteId(null);
                            setSelectedAd(null);
                        }}
                        title="Delete Ad"
                        message="Are you sure you want to permanently delete this ad?"
                        confirmText="Delete"
                        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    />
                )}
                 {adToReview && (
                    <FeedbackModal 
                        ad={adToReview}
                        onClose={() => setAdToReview(null)}
                        onSave={handleSaveFeedback}
                    />
                )}
                {toast && (
                    <ToastNotification 
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </APIProvider>
    );
};

export default App;