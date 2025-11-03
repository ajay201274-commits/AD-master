
import React, { useState, useEffect, FormEvent } from 'react';
import * as api from '../services/api';
import { Logo } from './icons/Logo';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

type LoginMethod = 'phone' | 'email';
type LoginStep = 'enter-contact' | 'enter-otp';
type EmailView = 'login' | 'forgot-password';
type EmailFormMode = 'login' | 'signup';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
    const [step, setStep] = useState<LoginStep>('enter-contact');
    const [emailView, setEmailView] = useState<EmailView>('login');
    const [emailFormMode, setEmailFormMode] = useState<EmailFormMode>('login');
    
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);

    const GoogleIcon = ({ className = "w-5 h-5 mr-3" }: { className?: string }) => (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.218,44,30.608,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    );

    useEffect(() => {
        if (resendCooldown > 0) {
            const timerId = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timerId);
        }
    }, [resendCooldown]);

    const validateContact = (method: LoginMethod, value: string) => {
        if (method === 'phone') {
            return /^\d{10,}$/.test(value.replace(/\D/g, '')) ? '' : 'Please enter a valid phone number.';
        }
        if (method === 'email') {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address.';
        }
        return '';
    };

    const handleSendOtpRequest = async (isResend = false) => {
        if (isLoading) return;
        if (isResend && resendCooldown > 0) return;

        setError(null);
        setInfo(null);
        
        if (!isResend) {
            const validationError = validateContact(loginMethod, contact);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        setIsLoading(true);
        const response = await api.sendOtp(contact);
        setIsLoading(false);

        if (response.success) {
            setStep('enter-otp');
            setInfo(isResend ? `A new OTP has been sent.` : response.message);
            setResendCooldown(60);
        } else {
            setError(response.message);
        }
    };

    const handleVerifyOtp = async () => {
        setError(null);
        setInfo(null);
        if (otp.length !== 6) {
            setError('OTP must be 6 digits.');
            return;
        }

        setIsLoading(true);
        const response = await api.verifyOtp(contact, otp);
        setIsLoading(false);
        
        if (response.success) {
            onLoginSuccess();
        } else {
            setError(response.message);
        }
    };
    
    const handleMethodChange = (method: LoginMethod) => {
        setLoginMethod(method);
        setContact('');
        setOtp('');
        setPassword('');
        setError(null);
        setInfo(null);
        setStep('enter-contact');
        setEmailView('login');
        setResendCooldown(0);
        setEmailFormMode('login');
        setName('');
    };

    const handleEmailPasswordLogin = async () => {
        setError(null);
        setInfo(null);
        if (!contact) return setError('Please enter your email.');
        if (!password) return setError('Please enter your password.');

        setIsLoading(true);
        const response = await api.loginWithEmailPassword(contact, password);
        setIsLoading(false);

        if (response.success) {
            onLoginSuccess();
        } else {
            setError(response.message);
        }
    };

    const handleEmailSignUp = async () => {
        setError(null);
        setInfo(null);
        if (!name.trim()) return setError('Please enter your name.');
        const emailError = validateContact('email', contact);
        if (emailError) return setError(emailError);
        if (password.length < 6) return setError('Password must be at least 6 characters.');

        setIsLoading(true);
        const response = await api.signupWithEmailPassword({ name, email: contact, password });
        setIsLoading(false);

        if (response.success) {
          onLoginSuccess();
        } else {
          setError(response.message);
        }
    };

    const handlePasswordResetRequest = async () => {
        setError(null);
        setInfo(null);
        const validationError = validateContact('email', contact);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        const response = await api.sendPasswordResetLink(contact);
        setIsLoading(false);

        if (response.success) {
            setInfo(response.message);
        } else {
            setError(response.message);
        }
    };

    const inputClass = "block w-full px-4 py-2.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-indigo-400 focus:ring-opacity-40 dark:focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors";
    const otpInputClass = "block w-full px-4 py-2.5 text-center tracking-[1em] text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-indigo-400 focus:ring-opacity-40 dark:focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors";
    const primaryButtonClass = "w-full px-4 py-2.5 text-sm font-medium tracking-wide text-white capitalize transition-all duration-300 transform bg-indigo-600 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-50 disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:scale-105 active:scale-95";

    const renderPhoneLogin = () => (
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); step === 'enter-contact' ? handleSendOtpRequest(false) : handleVerifyOtp(); }}>
            <div className="space-y-4">
                {step === 'enter-contact' ? (
                     <div>
                        <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="contact-phone">
                            Mobile Number
                        </label>
                        <input id="contact-phone" className={inputClass} type="tel" placeholder="e.g., 9876543210" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isLoading} />
                    </div>
                ) : (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="otp">
                            One-Time Password (OTP)
                        </label>
                        <input id="otp" className={otpInputClass} type="tel" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} disabled={isLoading} />
                    </div>
                )}
            </div>

            <div className="mt-6">
                <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                    {isLoading ? 'Please wait...' : step === 'enter-contact' ? 'Send OTP' : 'Verify & Continue'}
                </button>
            </div>

            {step === 'enter-otp' && (
                <div className="mt-4 flex justify-between items-center">
                    <button type="button" onClick={() => { setStep('enter-contact'); setOtp(''); setError(null); setInfo(null); }} disabled={isLoading} className="text-xs text-slate-500 dark:text-slate-400 hover:underline">Back</button>
                    <button type="button" onClick={() => handleSendOtpRequest(true)} disabled={isLoading || resendCooldown > 0} className="text-xs text-slate-500 dark:text-slate-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                </div>
            )}
        </form>
    );
    
    const renderEmailLogin = () => {
        if (emailView === 'forgot-password') {
            return (
                 <form onSubmit={(e: FormEvent) => { e.preventDefault(); handlePasswordResetRequest(); }}>
                    <h3 className="text-lg font-semibold text-center text-slate-800 dark:text-white mb-4">Reset your password</h3>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="contact-email-forgot">
                            Email Address
                        </label>
                        <input id="contact-email-forgot" className={inputClass} type="email" placeholder="you@example.com" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="mt-6">
                         <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                     <div className="mt-4 text-center">
                        <button type="button" onClick={() => setEmailView('login')} disabled={isLoading} className="text-xs text-slate-500 dark:text-slate-400 hover:underline">Back to Login</button>
                    </div>
                </form>
            );
        }

        return (
            <>
                <button onClick={onLoginSuccess} className="w-full flex items-center justify-center px-4 py-2.5 border rounded-lg transition-all duration-300 transform bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 active:scale-95">
                    <GoogleIcon />
                    <span className="text-sm font-semibold">Continue with Google</span>
                </button>
                <div className="flex items-center my-6">
                    <span className="flex-grow h-px bg-slate-200 dark:bg-slate-600"></span>
                    <span className="flex-shrink px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Or</span>
                    <span className="flex-grow h-px bg-slate-200 dark:bg-slate-600"></span>
                </div>
                
                {emailFormMode === 'login' ? (
                     <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleEmailPasswordLogin(); }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="contact-email">
                                    Email Address
                                </label>
                                <input id="contact-email" className={inputClass} type="email" placeholder="you@example.com" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isLoading} />
                            </div>
                             <div>
                                <div className="flex justify-between">
                                    <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="password">
                                        Password
                                    </label>
                                    <button type="button" onClick={() => setEmailView('forgot-password')} className="text-xs text-slate-500 dark:text-slate-400 hover:underline">Forgot Password?</button>
                                </div>
                                <input id="password" className={inputClass} type="password" placeholder="Your Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>
                         <div className="mt-6">
                            <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                ) : (
                     <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleEmailSignUp(); }}>
                        <div className="space-y-4">
                             <div>
                                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="name">
                                    Full Name
                                </label>
                                <input id="name" className={inputClass} type="text" placeholder="e.g., Alex Doe" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="signup-email">
                                    Email Address
                                </label>
                                <input id="signup-email" className={inputClass} type="email" placeholder="you@example.com" value={contact} onChange={(e) => setContact(e.target.value)} disabled={isLoading} />
                            </div>
                             <div>
                                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="signup-password">
                                    Password
                                </label>
                                <input id="signup-password" className={inputClass} type="password" placeholder="6+ characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>
                         <div className="mt-6">
                            <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                )}
                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {emailFormMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setEmailFormMode(p => p === 'login' ? 'signup' : 'login')} disabled={isLoading} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            {emailFormMode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </>
        );
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200 dark:border-slate-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <Logo className="h-12 w-12 mx-auto" />
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-tighter">Welcome to AdMaster</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 h-5">
                             {info ? '' : 
                             (loginMethod === 'phone' && step === 'enter-otp' ? 'Enter the OTP sent to your device.' : 
                             (emailView === 'forgot-password' ? 'We’ll send you a reset link.' : 'Sign in or create an account.'))}
                        </p>
                    </div>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg mb-6">
                        <button onClick={() => handleMethodChange('phone')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${loginMethod === 'phone' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                            Mobile
                        </button>
                         <button onClick={() => handleMethodChange('email')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${loginMethod === 'email' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                            Email
                        </button>
                    </div>

                    {info && <p className="mb-4 text-xs text-center text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded-md">{info}</p>}
                    {error && <p className="mb-4 text-xs text-center text-red-500 dark:text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
                    
                    {loginMethod === 'phone' ? renderPhoneLogin() : renderEmailLogin()}

                     <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 text-center">
                        By continuing, you agree to our <a href="#" className="underline">Terms of Service</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;