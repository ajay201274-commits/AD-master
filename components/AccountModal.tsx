import React, { useState, useCallback, FormEvent, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { BankAccount, Transaction, TransactionStatus, TransactionType, UserRole, User } from '../types';
import WithdrawModal from './WithdrawModal';
import BankAccountModal from './BankAccountModal';
import { ProfileIcon } from './icons/NavIcons';
import { UpiIcon } from './icons/UpiIcon';
import { WalletIcon } from './icons/WalletIcon';
import { Spinner } from './icons/AIIcons';
import { GooglePayIcon, PhonePeIcon, PaytmIcon } from './icons/PaymentIcons';

interface AccountModalProps {
    userRole: UserRole;
    balance: number;
    bankAccount: BankAccount | null;
    transactions: Transaction[];
    userProfile: User | null;
    onClose: () => void;
    onAddFunds: (amount: number) => void;
    onWithdraw: (amount: number) => void;
    onSavePaymentDetails: (details: Partial<BankAccount>) => void;
    onSaveProfile: (data: Partial<Omit<User, 'id'>>, pictureFile: File | null) => Promise<void>;
}

type ActiveView = 'transactions' | 'add' | 'withdraw' | 'profile' | 'payment';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const TransactionIcon: React.FC<{ type: TransactionType }> = ({ type }) => {
    const baseClass = "w-10 h-10 rounded-full flex items-center justify-center text-lg";
    switch(type) {
        case TransactionType.EARNED:
            return <div className={`${baseClass} bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400`}>🎁</div>;
        case TransactionType.DEPOSIT:
            return <div className={`${baseClass} bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400`}>➕</div>;
        case TransactionType.WITHDRAWAL:
            return <div className={`${baseClass} bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400`}>💳</div>;
        default:
            return null;
    }
}

const AddFundsView: React.FC<{ onAddFunds: (amount: number) => void; onClose: () => void }> = ({ onAddFunds, onClose }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        onAddFunds(numAmount);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-center p-4">
            <h3 className="text-xl font-bold">Add Funds to Wallet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter the amount you'd like to deposit.</p>
            <div>
                <label htmlFor="deposit-amount" className="sr-only">Amount</label>
                <div className="relative">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">₹</span>
                    <input
                        id="deposit-amount"
                        type="number"
                        value={amount}
                        onChange={e => { setAmount(e.target.value); setError(''); }}
                        className="w-full text-center text-3xl font-bold bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0.00"
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">You will be redirected to our secure payment partner.</p>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                Add {amount ? formatCurrency(parseFloat(amount)) : 'Funds'}
            </button>
        </form>
    );
};

const getInputClass = () => 
    `w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-white`;

const ProfileSettingsView: React.FC<{
    userProfile: User;
    onSave: (data: Partial<Omit<User, 'id'>>, pictureFile: File | null) => Promise<void>;
}> = ({ userProfile, onSave }) => {
    const [formData, setFormData] = useState({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
    });
    const [pictureFile, setPictureFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(userProfile.profilePictureUrl);
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setPictureFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png'] },
        multiple: false,
    });

    useEffect(() => {
        return () => {
            if (preview && pictureFile) {
                 URL.revokeObjectURL(preview);
            }
        };
    }, [preview, pictureFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSave(formData, pictureFile);
        setIsLoading(false);
        setPictureFile(null);
    };

    return (
        <form onSubmit={handleSave}>
            <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
            <div className="space-y-6">
                <div className="flex items-center space-x-6">
                    <div {...getRootProps()} className="relative cursor-pointer group flex-shrink-0">
                        <img src={preview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-sm" />
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input {...getInputProps()} />
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={getInputClass()} />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={getInputClass()} />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={getInputClass()} />
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isLoading} className="py-2.5 px-6 bg-indigo-600 text-white font-bold rounded-lg w-40 flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600">
                        {isLoading ? <Spinner className="w-5 h-5"/> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
    );
};


const AccountModal: React.FC<AccountModalProps> = ({ userRole, balance, bankAccount, transactions, userProfile, onClose, onAddFunds, onWithdraw, onSavePaymentDetails, onSaveProfile }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<ActiveView>('transactions');
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');

    useEffect(() => {
        setUpiId(bankAccount?.upiId || '');
    }, [bankAccount]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    const handleUpiSave = () => {
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        if (upiId && !upiRegex.test(upiId)) {
            setUpiError('Please enter a valid UPI ID (e.g., user@bank)');
            return;
        }
        setUpiError('');
        onSavePaymentDetails({ upiId });
    };

    const animationClasses = isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100';

    const canAddFunds = userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER;

    const NavButton: React.FC<{ view: ActiveView; label: string, icon: React.ReactNode }> = ({ view, label, icon }) => (
        <button onClick={() => setActiveView(view)} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors text-sm font-medium ${activeView === view ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {icon}
            <span>{label}</span>
        </button>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'transactions':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                        {transactions.length > 0 ? (
                            <ul className="space-y-3">
                                {transactions.map(tx => (
                                    <li key={tx.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50">
                                        <TransactionIcon type={tx.type} />
                                        <div className="flex-grow">
                                            <p className="font-semibold">{tx.description}</p>
                                            <div className="flex items-center space-x-2">
                                                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                                                    {tx.status === TransactionStatus.PENDING && (
                                                        <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">Pending</span>
                                                    )}
                                            </div>
                                        </div>
                                        <p className={`font-bold text-lg ${tx.type === TransactionType.EARNED || tx.type === TransactionType.DEPOSIT ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {tx.type === TransactionType.EARNED || tx.type === TransactionType.DEPOSIT ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No transactions yet.</p>
                        )}
                    </div>
                );
            case 'add':
                return <AddFundsView onAddFunds={onAddFunds} onClose={handleClose} />;
            case 'withdraw':
                return (
                    <div className="text-center p-4">
                        <h3 className="text-xl font-bold mb-2">Withdraw Earnings</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Transfer your available balance to your bank account.</p>
                        {bankAccount?.accountNumber ? (
                            <>
                                <div className="text-left text-sm bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 mb-4">
                                    <p className="text-slate-600 dark:text-slate-300">Funds will be sent to:</p>
                                    <p className="font-semibold">{bankAccount.bankName} - ****{bankAccount.accountNumber.slice(-4)}</p>
                                </div>
                                <button onClick={() => setIsWithdrawModalOpen(true)} disabled={balance <= 0} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    Initiate Withdrawal
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="mb-4">No bank account linked.</p>
                                <button onClick={() => setActiveView('payment')} className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-lg">
                                    Add Payment Method
                                </button>
                            </>
                        )}
                    </div>
                );
            case 'profile':
                 return userProfile ? (
                    <ProfileSettingsView userProfile={userProfile} onSave={onSaveProfile} />
                ) : null;
            case 'payment':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4">Payment Settings</h3>
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2">Bank Account</h4>
                            {(bankAccount && bankAccount.accountNumber) ? (
                                 <div className="p-4 border rounded-lg bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 space-y-1">
                                    <p><strong>Holder:</strong> {bankAccount.accountHolderName}</p>
                                    <p><strong>Bank:</strong> {bankAccount.bankName}</p>
                                    <p><strong>Account No:</strong> ****{bankAccount.accountNumber.slice(-4)}</p>
                                    <p><strong>IFSC:</strong> {bankAccount.ifscCode}</p>
                                    <button onClick={() => setIsBankModalOpen(true)} className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Edit Details</button>
                                </div>
                            ) : (
                                 <div className="text-center p-8 border-2 border-dashed rounded-lg border-slate-300 dark:border-slate-600">
                                    <p className="mb-4 text-slate-500 dark:text-slate-400">No bank account linked.</p>
                                    <button onClick={() => setIsBankModalOpen(true)} className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-lg">Add Bank Account</button>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">UPI ID</h4>
                             <div className="p-4 border rounded-lg bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                                <label htmlFor="upi-id" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Your UPI ID for withdrawals</label>

                                <div className="flex items-center space-x-2 mb-3">
                                    <GooglePayIcon className="h-5 w-auto" />
                                    <PhonePeIcon className="h-5 w-auto" />
                                    <PaytmIcon className="h-5 w-auto" />
                                </div>

                                <div className="flex items-start sm:items-center flex-col sm:flex-row sm:space-x-2">
                                    <input
                                        id="upi-id"
                                        type="text"
                                        value={upiId}
                                        onChange={e => {setUpiId(e.target.value); setUpiError('');}}
                                        placeholder="yourname@bank"
                                        className="w-full bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <button onClick={handleUpiSave} className="py-2.5 mt-2 sm:mt-0 px-5 bg-indigo-600 text-white font-bold rounded-lg w-full sm:w-auto flex-shrink-0 hover:bg-indigo-500 transition-colors">Save</button>
                                </div>
                                {upiError && <p className="text-red-500 text-sm mt-1">{upiError}</p>}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You can find your UPI ID in your Google Pay, PhonePe, Paytm, or other banking apps.</p>
                            </div>
                        </div>
                    </div>
                 );
            default:
                return null;
        }
    };

    return (
    <>
        <div className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50" onClick={handleClose}>
            <div className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account & Wallet</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">&times;</button>
                </div>

                <div className="flex-grow flex overflow-hidden">
                    <aside className="w-1/3 max-w-xs p-4 border-r border-slate-200 dark:border-slate-800/80 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                        <div className="text-center mb-6">
                            <img src={userProfile?.profilePictureUrl} alt={userProfile?.name} className="w-20 h-20 rounded-full mx-auto mb-3" />
                            <p className="font-bold text-lg">{userProfile?.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{userProfile?.email}</p>
                            <div className="mt-4 bg-white dark:bg-slate-800/60 p-3 rounded-lg">
                                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Balance</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(balance)}</p>
                            </div>
                        </div>
                        <nav className="flex-grow space-y-4">
                            <div>
                                <h3 className="flex items-center space-x-2 px-3 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    <WalletIcon className="w-4 h-4" />
                                    <span>Wallet</span>
                                </h3>
                                <div className="space-y-1">
                                    <NavButton view="transactions" label="Transactions" icon={<span className="text-lg w-5 h-5 flex items-center justify-center">📜</span>} />
                                    {canAddFunds && <NavButton view="add" label="Add Funds" icon={<span className="text-lg w-5 h-5 flex items-center justify-center">➕</span>} />}
                                    <NavButton view="withdraw" label="Withdraw" icon={<span className="text-lg w-5 h-5 flex items-center justify-center">💳</span>} />
                                </div>
                            </div>
                            <div>
                                <h3 className="flex items-center space-x-2 px-3 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    <ProfileIcon className="w-4 h-4" />
                                    <span>Account</span>
                                </h3>
                                <div className="space-y-1">
                                    <NavButton view="profile" label="Profile Settings" icon={<ProfileIcon className="w-5 h-5" />} />
                                    <NavButton view="payment" label="Payment Settings" icon={<UpiIcon className="w-5 h-5" />} />
                                </div>
                            </div>
                        </nav>
                    </aside>
                    <main className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
        {isWithdrawModalOpen && <WithdrawModal onClose={() => setIsWithdrawModalOpen(false)} onWithdraw={onWithdraw} balance={balance} bankAccount={bankAccount} />}
        {isBankModalOpen && <BankAccountModal onClose={() => setIsBankModalOpen(false)} onSave={(account) => { onSavePaymentDetails(account); setIsBankModalOpen(false); }} bankAccount={bankAccount} />}
    </>
    );
};

export default AccountModal;