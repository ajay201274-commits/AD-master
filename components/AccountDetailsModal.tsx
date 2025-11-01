import React, { useState, useCallback, useRef, FormEvent, useEffect } from 'react';
import { BankAccount, Transaction, TransactionType, UserRole, User, Ad, TransactionStatus } from '../types';
import BankAccountModal from './BankAccountModal';
import WithdrawModal from './WithdrawModal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/DetailIcons';

type ActiveTab = 'profile' | 'bank' | 'transactions';

const StatusIcon = ({ status }: { status: TransactionStatus }) => {
    switch (status) {
        case TransactionStatus.COMPLETED:
            return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        case TransactionStatus.PENDING:
            return <ClockIcon className="w-5 h-5 text-amber-500" />;
        case TransactionStatus.FAILED:
            return <CheckCircleIcon className="w-5 h-5 text-red-500" />; // Replace with a fail icon if you have one
        default:
            return null;
    }
}

const AccountDetailsModal: React.FC<{
  userProfile: User | null;
  balance: number;
  bankAccount: BankAccount | null;
  transactions: Transaction[];
  isLoading: boolean;
  onClose: () => void;
  onSaveBankAccount: (account: BankAccount) => void;
  onWithdraw: (amount: number) => void;
  userRole: UserRole;
  onUpdateProfilePicture: (file: File) => void;
  onUpdateUserProfile: (data: Partial<Omit<User, 'id'>>) => void;
}> = ({
  userProfile,
  balance,
  bankAccount,
  transactions,
  isLoading,
  onClose,
  onSaveBankAccount,
  onWithdraw,
  userRole,
  onUpdateProfilePicture,
  onUpdateUserProfile,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const animationClasses = isClosing ? 'opacity-0 scale-95 -translate-y-10' : 'opacity-100 scale-100 translate-y-0';
  
  const TabButton = ({ tab, label }: {tab: ActiveTab, label: string}) => (
    <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-md w-full text-left ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
        {label}
    </button>
  )

  return (
    <>
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">My Account</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70">&times;</button>
        </div>
        
        <div className="flex-grow flex overflow-hidden">
            <aside className="w-1/4 p-4 border-r">
                <div className="flex items-center space-x-3 mb-6">
                    <img src={userProfile?.profilePictureUrl} alt={userProfile?.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="font-bold">{userProfile?.name}</p>
                        <p className="text-xs text-slate-500">{userProfile?.email}</p>
                    </div>
                </div>
                 <nav className="space-y-2">
                    <TabButton tab="profile" label="Profile & Balance" />
                    <TabButton tab="bank" label="Bank Account" />
                    <TabButton tab="transactions" label="Transactions" />
                 </nav>
            </aside>

            <main className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'profile' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Profile</h3>
                         <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg text-center border">
                            <p className="text-sm uppercase tracking-wider">Available Balance</p>
                            <p className="text-5xl font-bold tracking-tight mt-1">₹{balance.toFixed(2)}</p>
                             <button onClick={() => setIsWithdrawModalOpen(true)} disabled={!bankAccount || balance <= 0} className="mt-4 py-2 px-5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                Withdraw Funds
                            </button>
                        </div>
                    </div>
                )}
                 {activeTab === 'bank' && (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Bank Account Details</h3>
                        {bankAccount ? (
                             <div className="p-4 border rounded-lg bg-slate-100 dark:bg-slate-900/50">
                                <p><strong>Holder:</strong> {bankAccount.accountHolderName}</p>
                                <p><strong>Bank:</strong> {bankAccount.bankName}</p>
                                <p><strong>Account No:</strong> ****{bankAccount.accountNumber.slice(-4)}</p>
                                <p><strong>IFSC:</strong> {bankAccount.ifscCode}</p>
                                <button onClick={() => setIsBankModalOpen(true)} className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">Edit Details</button>
                            </div>
                        ) : (
                             <div className="text-center p-8 border-2 border-dashed rounded-lg">
                                <p className="mb-4">No bank account linked. Add one to withdraw your earnings.</p>
                                <button onClick={() => setIsBankModalOpen(true)} className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-lg">Add Bank Account</button>
                            </div>
                        )}
                    </div>
                 )}
                 {activeTab === 'transactions' && (
                     <div>
                        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                        <div className="space-y-2">
                            {transactions.map(tx => (
                                <div key={tx.id} className="p-3 border-b flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <StatusIcon status={tx.status} />
                                        <div>
                                            <p className="font-semibold">{tx.description}</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                                                <span className={`text-xs font-bold capitalize px-2 py-0.5 rounded-full ${tx.status === TransactionStatus.PENDING ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{tx.status.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-lg ${tx.type === TransactionType.EARNED ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                       {tx.type === TransactionType.EARNED ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
            </main>
        </div>
      </div>
    </div>
    {isBankModalOpen && <BankAccountModal onClose={() => setIsBankModalOpen(false)} onSave={onSaveBankAccount} bankAccount={bankAccount} />}
    {isWithdrawModalOpen && <WithdrawModal onClose={() => setIsWithdrawModalOpen(false)} onWithdraw={onWithdraw} balance={balance} bankAccount={bankAccount} />}
    </>
  );
};

export default AccountDetailsModal;