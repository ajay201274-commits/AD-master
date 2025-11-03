import { Ad, Feedback, LeaderboardUser, User, Transaction, TransactionStatus, TransactionType, Sentiment, UserRole } from "../types";
import { MOCK_ADS } from "../constants";

// Mock data
let mockFeedback: Feedback[] = [
    { id: 'fb-001', adId: 'ad-001', userId: 'user-456', rating: 5, text: "Absolutely loved this tribute to Dhoni! Brought back so many memories. Great ad!", sentiment: Sentiment.POSITIVE, summary: "User loved the nostalgic tribute to cricketer MS Dhoni.", date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'fb-002', adId: 'ad-001', userId: 'user-789', rating: 4, text: "Good compilation, but could have included the 2011 world cup winning shot clearly.", sentiment: Sentiment.NEUTRAL, summary: "User found the ad good but suggested an improvement.", date: new Date(Date.now() - 172800000).toISOString() },
    { id: 'fb-003', adId: 'ad-002', userId: 'user-123', rating: 5, text: "Amazing deals! I bought a new phone thanks to this ad. The visuals were very festive.", sentiment: Sentiment.POSITIVE, summary: "User appreciated the great deals and festive visuals.", date: new Date().toISOString() },
];

let mockUsers: User[] = [
    { id: 'user-123', name: 'Rohan Sharma', email: 'rohan@example.com', phone: '9876543210', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-123', role: UserRole.VIEWER },
    { id: 'user-456', name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-456', role: UserRole.VIEWER },
    { id: 'user-789', name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-789', role: UserRole.VIEWER },
    { id: 'user-101', name: 'Sunita Devi', email: 'sunita@example.com', phone: '9876543213', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-101', role: UserRole.UPLOADER },
    { id: 'user-112', name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-112', role: UserRole.VIEWER },
    { id: 'user-999', name: 'Admin Owner', email: 'admin@example.com', phone: '9999999999', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-999', role: UserRole.APP_OWNER },
];

// Mock API functions
export const fetchAds = async (): Promise<Ad[]> => {
    console.log("API: Fetching ads...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return MOCK_ADS;
};

export const fetchFeedbackForAd = async (adId: string): Promise<Feedback[]> => {
    console.log(`API: Fetching feedback for ad ${adId}...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockFeedback.filter(f => f.adId === adId);
};

export const saveFeedback = async (feedback: Omit<Feedback, 'id'>): Promise<Feedback> => {
    console.log("API: Saving feedback...", feedback);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newFeedback = { ...feedback, id: `fb-${Date.now()}` };
    mockFeedback.push(newFeedback);
    return newFeedback;
}

export const fetchLeaderboardData = async (): Promise<LeaderboardUser[]> => {
    console.log("API: Fetching leaderboard data...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockUsers.map(user => ({
        id: user.id,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
        totalEarnings: Math.random() * 5000 + 500,
        adsWatched: Math.floor(Math.random() * 200 + 20),
    })).sort((a, b) => b.totalEarnings - a.totalEarnings);
};

export const fetchAllUsers = async (): Promise<User[]> => {
    console.log("API: Fetching all users...");
    await new Promise(resolve => setTimeout(resolve, 500));
    // Ensure the admin user is always present, even if filtered out elsewhere
    if (!mockUsers.find(u => u.role === UserRole.APP_OWNER)) {
        mockUsers.push({ id: 'user-999', name: 'Admin Owner', email: 'admin@example.com', phone: '9999999999', profilePictureUrl: 'https://i.pravatar.cc/150?u=user-999', role: UserRole.APP_OWNER });
    }
    return mockUsers;
};

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    console.log(`API: Deleting user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(u => u.id !== userId);
    return { success: mockUsers.length < initialLength };
};


// --- Mock Auth ---
export const sendOtp = async (contact: string): Promise<{ success: boolean; message: string }> => {
    console.log(`API: Sending OTP to ${contact}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `An OTP has been sent to ${contact}.` };
};

export const verifyOtp = async (contact: string, otp: string): Promise<{ success: boolean; message: string }> => {
    console.log(`API: Verifying OTP ${otp} for ${contact}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp === "123456") {
        return { success: true, message: "Login successful!" };
    }
    return { success: false, message: "Invalid OTP. Please try again." };
};

export const loginWithEmailPassword = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    console.log(`API: Logging in with ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'user@example.com' && pass === 'password123') {
        return { success: true, message: "Login successful!" };
    }
    return { success: false, message: "Invalid email or password." };
}

export const signupWithEmailPassword = async (data: {name: string, email: string, password: string}): Promise<{ success: boolean, message: string }> => {
    console.log(`API: Signing up ${data.email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Account created successfully!" };
}

export const sendPasswordResetLink = async (email: string): Promise<{ success: boolean; message: string }> => {
    console.log(`API: Sending password reset to ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `If an account exists for ${email}, a reset link has been sent.` };
}