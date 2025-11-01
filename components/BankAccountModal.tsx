
import React, { useState, useCallback, FormEvent } from 'react';
import { BankAccount } from '../types';

interface BankAccountModalProps {
  onClose: () => void;
  onSave: (account: BankAccount) => void;
  bankAccount: BankAccount | null;
}

const BankAccountModal: React.FC<BankAccountModalProps> = ({ onClose, onSave, bankAccount }) => {
  const [formData, setFormData] = useState<BankAccount>(
    bankAccount || {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
    }
  );
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BankAccount, string>>>({});

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const validate = () => {
    const newErrors: Partial<Record<keyof BankAccount, string>> = {};
    if (formData.accountHolderName.trim().length < 2) {
      newErrors.accountHolderName = 'Must be at least 2 characters.';
    }
    if (!/^\d{8,12}$/.test(formData.accountNumber)) {
        newErrors.accountNumber = 'Must be a valid account number (8-12 digits).';
    }
    if (formData.bankName.trim().length < 2) {
        newErrors.bankName = 'Must be at least 2 characters.';
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
        newErrors.ifscCode = 'Must be a valid 11-character IFSC code.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      handleClose();
    }
  };

  const animationClasses = isClosing 
    ? 'opacity-0 scale-95 -translate-y-10' 
    : 'opacity-100 scale-100 translate-y-0';

  const getInputClass = (name: keyof BankAccount) => 
    `w-full bg-slate-100 dark:bg-slate-800/60 border text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500 ${errors[name] ? 'border-red-500/70' : 'border-slate-300 dark:border-slate-600/80'}`;

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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{bankAccount ? 'Edit' : 'Add'} Bank Account</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="accountHolderName" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Account Holder Name</label>
            <input type="text" name="accountHolderName" id="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className={getInputClass('accountHolderName')} />
            {errors.accountHolderName && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.accountHolderName}</p>}
          </div>
          <div>
            <label htmlFor="bankName" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Bank Name</label>
            <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleChange} className={getInputClass('bankName')} />
            {errors.bankName && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.bankName}</p>}
          </div>
          <div>
            <label htmlFor="accountNumber" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Account Number</label>
            <input type="text" name="accountNumber" id="accountNumber" value={formData.accountNumber} onChange={handleChange} className={getInputClass('accountNumber')} />
            {errors.accountNumber && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.accountNumber}</p>}
          </div>
          <div>
            <label htmlFor="ifscCode" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">IFSC Code</label>
            <input type="text" name="ifscCode" id="ifscCode" value={formData.ifscCode} onChange={handleChange} className={getInputClass('ifscCode')} />
            {errors.ifscCode && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.ifscCode}</p>}
          </div>
        </form>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 flex justify-end items-center space-x-3">
            <button onClick={handleClose} type="button" className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white font-bold rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/50">Save Account</button>
        </div>
      </div>
    </div>
  );
};

export default BankAccountModal;