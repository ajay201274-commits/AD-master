import { BankAccount, Feedback, Transaction, TransactionType, User, Ad, TransactionStatus } from '../types';
import { MOCK_ADS, STARTING_BALANCE } from '../constants';

// =================================================================
// Mock Database & LocalStorage
// =================================================================

// A helper to safely parse JSON from localStorage
function safeJSONParse<T>(key: string, fallback: T | null): T | null {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        // Clear corrupted data to prevent future errors
        localStorage.removeItem(key);
    }
    return fallback;
}

let mockAds: Ad[] = safeJSONParse<Ad[]>('ads', null) || [...MOCK_ADS];
let mockFeedback: Feedback[] = safeJSONParse<Feedback[]>('feedback', null) || [
    { id: 'fb-001', adId: 'ad-001', userId: 'user-123', rating: 5, text: 'Great ad, very inspiring!', sentiment: 'Positive', summary: 'User found the ad inspiring.', date: new Date().toISOString() }
];
let mockTransactions: Transaction[] = safeJSONParse<Transaction[]>('transactions', null) || [
    { id: 'tx-init', type: TransactionType.EARNED, status: TransactionStatus.COMPLETED, description: 'Initial account balance', amount: STARTING_BALANCE, date: new Date().toISOString() }
];

const saveData = () => {
  localStorage.setItem('ads', JSON.stringify(mockAds));
  localStorage.setItem('feedback', JSON.stringify(mockFeedback));
  localStorage.setItem('transactions', JSON.stringify(mockTransactions));
};

// Simulate API calls
const simulateApiCall = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

// =================================================================
// Ad API
// =================================================================
export const fetchAds = (): Promise<Ad[]> => simulateApiCall(mockAds);

export const saveAd = (adData: Omit<Ad, 'rating'>): Promise<Ad> => {
    const isEditing = !!adData.id;
    if (isEditing) {
        const index = mockAds.findIndex(ad => ad.id === adData.id);
        if (index !== -1) {
            mockAds[index] = { ...mockAds[index], ...adData };
            saveData();
            return simulateApiCall(mockAds[index]);
        }
        return Promise.reject(new Error("Ad not found"));
    } else {
        const newAd: Ad = {
            ...adData,
            id: `ad-${Date.now()}-${Math.random()}`,
            rating: 0,
        };
        mockAds.unshift(newAd);
        saveData();
        return simulateApiCall(newAd);
    }
};

export const bulkDeleteAds = (adIds: string[]): Promise<{ success: boolean }> => {
    mockAds = mockAds.filter(ad => !adIds.includes(ad.id));
    saveData();
    return simulateApiCall({ success: true });
}

// =================================================================
// Feedback API
// =================================================================
export const fetchFeedbackForAd = (adId: string): Promise<Feedback[]> => {
  const adFeedback = mockFeedback.filter(f => f.adId === adId);
  return simulateApiCall(adFeedback.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 800);
};

export const saveFeedback = (feedback: Omit<Feedback, 'id'>): Promise<Feedback> => {
    const newFeedback: Feedback = { ...feedback, id: `fb-${Date.now()}` };
    mockFeedback.push(newFeedback);
    saveData();
    return simulateApiCall(newFeedback);
};

// =================================================================
// User & Account API
// =================================================================
export const fetchUserProfile = (): Promise<User> => {
    const user: User = {
        id: 'user-123',
        name: 'Rohan Sharma',
        email: 'rohan.sharma@example.com',
        phone: '+91 98765 43210',
        profilePictureUrl: 'https://i.pravatar.cc/150?u=rohansharma',
    };
    return simulateApiCall(user);
};

export const fetchBankAccount = (): Promise<BankAccount | null> => {
    return simulateApiCall(safeJSONParse<BankAccount>('bankAccount', null));
}

export const saveBankAccount = (account: BankAccount): Promise<BankAccount> => {
    localStorage.setItem('bankAccount', JSON.stringify(account));
    return simulateApiCall(account);
}

// =================================================================
// Transactions API
// =================================================================
export const fetchTransactions = (): Promise<Transaction[]> => {
    return simulateApiCall(mockTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    const newTransaction: Transaction = {
        ...transaction,
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
    };
    mockTransactions.push(newTransaction);
    saveData();
    return simulateApiCall(newTransaction);
}

export const processPendingWithdrawals = (): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let changed = false;
            mockTransactions.forEach(tx => {
                if (tx.type === TransactionType.WITHDRAWAL && tx.status === TransactionStatus.PENDING) {
                    tx.status = TransactionStatus.COMPLETED;
                    changed = true;
                }
            });
            if (changed) {
                saveData();
            }
            resolve(changed);
        }, 3000); // 3 second delay to simulate processing
    });
};


// =================================================================
// Auth APIs
// =================================================================
export const sendOtp = (contact: string): Promise<{ success: boolean; message: string }> => simulateApiCall({ success: true, message: `An OTP has been sent. (Hint: 123456)` });
export const verifyOtp = (contact: string, otp: string): Promise<{ success: boolean; message: string }> => {
    return otp === '123456' 
        ? simulateApiCall({ success: true, message: 'Login successful!' })
        : simulateApiCall({ success: false, message: 'Invalid OTP.' });
};
export const loginWithEmailPassword = (email: string, pass: string): Promise<{ success: boolean, message: string }> => {
    return pass === 'password'
        ? simulateApiCall({ success: true, message: 'Login successful!' })
        : simulateApiCall({ success: false, message: 'Invalid credentials.' });
};
export const signupWithEmailPassword = (data: { name: string, email: string, password: string }): Promise<{ success: boolean, message: string }> => simulateApiCall({ success: true, message: 'Signup successful!' });
export const sendPasswordResetLink = (email: string): Promise<{ success: boolean, message: string }> => simulateApiCall({ success: true, message: `A password reset link has been sent.` });
export const updateUserProfile = (data: Partial<Omit<User, 'id'>>): Promise<{ success: boolean, user: User }> => {
    const updatedUser: User = { id: 'user-123', name: data.name || 'Alex Doe', email: data.email || 'alex.doe@example.com', phone: data.phone || '+91 98765 43210', profilePictureUrl: 'https://i.pravatar.cc/150?u=alexdoe' };
    return simulateApiCall({ success: true, user: updatedUser });
}
export const updateProfilePicture = (file: File): Promise<{ success: boolean, url: string }> => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ success: true, url: reader.result as string });
    });
}