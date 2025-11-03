
import React from 'react';
import { HomeIcon, ProfileIcon } from './icons/NavIcons';
import { MyAdsIcon } from './icons/MyAdsIcon';
import { UserRole, AppView } from '../types';
import { CartIcon } from './icons/CartIcons';
import { FriendsIcon } from './icons/FriendsIcon';

interface BottomNavBarProps {
  onAccountClick: () => void;
  onFriendsClick: () => void;
  onCartClick: () => void;
  cartItemCount: number;
  isCartAnimating: boolean;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
}

const NavButton = ({ icon, label, onClick, isActive, badgeCount }: { icon: React.ReactNode, label: string, onClick?: () => void, isActive: boolean, badgeCount?: number }) => (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center transition-all w-20 transform active:scale-90 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400'}`}>
        {icon}
        <span className="text-xs font-medium mt-1">{label}</span>
        {badgeCount > 0 && (
             <span className="absolute top-0 right-3 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">{badgeCount}</span>
        )}
        {isActive && (
            <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
        )}
    </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
    onAccountClick, 
    onFriendsClick,
    onCartClick,
    cartItemCount,
    isCartAnimating,
    currentView, 
    onNavigate, 
    userRole 
}) => {
  const isUploader = userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER;
  
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700/50 z-20">
      <div className="container mx-auto px-2 h-16 flex justify-around items-center">
        <NavButton icon={<HomeIcon />} label="Home" onClick={() => onNavigate('home')} isActive={currentView === 'home'} />
        
        {isUploader ? (
             <NavButton icon={<MyAdsIcon />} label="My Ads" onClick={() => onNavigate('my-ads')} isActive={currentView === 'my-ads'} />
        ) : (
            <div className={isCartAnimating ? 'jiggle-animation' : ''}>
              <NavButton icon={<CartIcon />} label="Watchlist" onClick={onCartClick} isActive={false} badgeCount={cartItemCount} />
            </div>
        )}

        <div className="relative -mt-8">
            <button
                onClick={onFriendsClick}
                className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 transition-transform transform hover:scale-110 active:scale-95"
                aria-label="Open Friends and Chat"
            >
                <FriendsIcon className="w-8 h-8" />
            </button>
        </div>

        <NavButton icon={<ProfileIcon />} label="Account" onClick={onAccountClick} isActive={false} />
      </div>
    </footer>
  );
};

export default BottomNavBar;