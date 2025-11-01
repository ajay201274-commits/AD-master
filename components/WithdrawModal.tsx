

import React, { useState, useCallback, FormEvent } from 'react';
import { BankAccount } from '../types';
import { ErrorIcon } from './icons/ErrorIcon';

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number) => void;
  balance: number;
  bankAccount: BankAccount | null;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onWithdraw, balance, bankAccount }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid positive amount.';
    }
    if (numValue > balance) {
      return 'Withdrawal amount cannot exceed your balance.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAmount(value);
    if (error) {
      setError(validateAmount(value));
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
     const { value } = e.target;
     setError(validateAmount(value));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateAmount(amount);
    if (validationError) {
        setError(validationError);
        return;
    }
    onWithdraw(parseFloat(amount));
    handleClose();
  };

  const animationClasses = isClosing 
    ? 'opacity-0 scale-95 -translate-y-10' 
    : 'opacity-100 scale-100 translate-y-0';
    
  const getInputClass = () => 
    `w-full bg-slate-100 dark:bg-slate-800/60 border text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500 ${error ? 'border-red-500/70' : 'border-slate-300 dark:border-slate-600/80'}`;

  return (
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Withdraw Funds</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
                <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
            </div>
            {bankAccount && (
                <div className="text-center text-sm bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <p className="text-slate-600 dark:text-slate-300">Funds will be sent to:</p>
                    <p className="font-semibold">{bankAccount.bankName} - ****{bankAccount.accountNumber.slice(-4)}</p>
                </div>
            )}
            <div>
                <label htmlFor="amount" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Amount to Withdraw</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">₹</span>
                    <input 
                        type="number" 
                        name="amount" 
                        id="amount" 
                        value={amount} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        className={`${getInputClass()} pl-7`} 
                        placeholder="0.00"
                        step="0.01"
                        aria-invalid={!!error}
                        aria-describedby={error ? 'amount-error' : undefined}
                    />
                </div>
                {error && <div id="amount-error" className="flex items-center text-red-500 dark:text-red-400 text-sm mt-1" role="alert"><ErrorIcon className="w-4 h-4 mr-1.5 flex-shrink-0" /><span>{error}</span></div>}
            </div>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">Your withdrawal request will be processed. Funds may take up to 24 hours to reflect in your account.</p>
        </form>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 flex justify-end items-center space-x-3">
            <button onClick={handleClose} type="button" className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white font-bold rounded-lg transition-colors">Cancel</button>
            <button 
                onClick={handleSubmit} 
                type="submit" 
                disabled={!!validateAmount(amount) || amount === ''}
                className="py-2 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50"
            >
                Confirm Withdrawal
            </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;