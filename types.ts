// =================================================================
// Enums
// =================================================================

export enum AdCategory {
    ENTERTAINMENT = 'Entertainment',
    FASHION_APPAREL = 'Fashion & Apparel',
    FOOD_BEVERAGE = 'Food & Beverage',
    TRAVEL = 'Travel',
    TECH = 'Technology',
    AUTOMOTIVE = 'Automotive',
    SPORTS = 'Sports',
    GAMING = 'Gaming',
}

export enum UserRole {
    VIEWER = 'VIEWER',
    UPLOADER = 'UPLOADER',
    APP_OWNER = 'APP_OWNER'
}

export enum AdType {
    VIDEO = 'VIDEO',
    IMAGE = 'IMAGE',
}

export enum TransactionType {
    EARNED = 'EARNED',
    WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

// =================================================================
// Types
// =================================================================

export type SortBy = 'default' | 'reward-desc' | 'reward-asc' | 'duration-desc' | 'duration-asc';

export type AppView = 'home' | 'my-ads';

export type ToastType = 'success' | 'info' | 'error';

export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

// =================================================================
// Interfaces
// =================================================================

export interface Toast {
    message: string;
    type: ToastType;
}

export interface Ad {
  id: string;
  type: AdType;
  title: string;
  description: string;
  category: AdCategory;
  contentUrl: string;
  thumbnailUrl: string;
  posterImageUrl?: string; 
  duration: number; // in seconds
  reward: number; // in Rupees
  rating?: number;
  country?: string;
  state?: string;
  district?: string;
  lat?: number;
  lng?: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePictureUrl: string;
}

export interface BankAccount {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    description: string;
    amount: number;
    adId?: string;
    bankAccount?: BankAccount;
    date: string;
}

export interface Feedback {
  id: string;
  adId: string;
  userId: 'user-123';
  rating: number;
  text: string;
  sentiment: Sentiment;
  summary: string;
  date: string;
}