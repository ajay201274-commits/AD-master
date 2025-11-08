export enum UserRole {
  VIEWER = 'VIEWER',
  UPLOADER = 'UPLOADER',
  APP_OWNER = 'APP_OWNER',
}

export enum AdType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

export enum AdCategory {
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  AUTOMOTIVE = 'AUTOMOTIVE',
  TECHNOLOGY = 'TECHNOLOGY',
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  FINANCE = 'FINANCE',
}

export enum AdStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  type: AdType;
  category: AdCategory;
  reward: number;
  duration: number; // in seconds
  contentUrl: string;
  thumbnailUrl: string;
  country: string;
  state: string;
  district: string;
  lat?: number;
  lng?: number;
  rating?: number; // average rating
  ratingCount?: number; // number of ratings
  /** The unique identifier of the user who uploaded the ad. */
  uploaderId: string;
  /** The name of the user who uploaded the ad for display purposes. */
  uploaderName: string;
  status: AdStatus;
  rejectionReason?: string;
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral',
}

export interface Feedback {
  id: string;
  adId: string;
  userId: string;
  rating: number;
  text: string;
  sentiment: Sentiment;
  summary: string;
  date: string; // ISO string
}

export interface LeaderboardUser {
  id: string;
  name: string;
  profilePictureUrl: string;
  totalEarnings: number;
  adsWatched: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  role: UserRole;
}

export enum TransactionType {
  EARNED = 'EARNED',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
}

export interface BankAccount {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
}

export enum AppView {
    HOME = 'home',
    MY_ADS = 'my-ads',
}

export interface Friend {
  id: string;
  name: string;
  profilePictureUrl: string;
  isOnline: boolean;
}

export type ToastType = 'success' | 'info' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export enum ReportReason {
  INAPPROPRIATE = 'Inappropriate or Offensive Content',
  MISLEADING = 'Misleading Information or Scam',
  VIOLENT = 'Violent or Graphic Content',
  SPAM = 'Spam or Repetitive',
  OTHER = 'Other',
}

// Chat Types
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO string
  isRead?: boolean;
}

export interface Conversation {
  contactId: string;
  messages: Message[];
}