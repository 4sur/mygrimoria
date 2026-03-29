import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaMicrosoft } from 'react-icons/fa';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignup, setIsSignup] = useState(false);
    const { login, signup, loginWithProvider } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/oracle';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isSignup) {
                await signup(email, password);
                navigate(from, { replace: true });
            } else {
                await login(email, password);
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            setError(err.message || (isSignup ? 'Failed to sign up' : 'Failed to login'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure') => {
        setIsLoading(true);
        setError(null);
        try {
            await loginWithProvider(provider);
        } catch (err: any) {
            setError(err.message || `Failed to login with ${provider}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-ink/5 dark:bg-white/5 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ink/5 dark:bg-white/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-ink/80 backdrop-blur-xl border border-ink/5 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink dark:bg-white mb-6"
                        >
                            <LogIn className="text-white dark:text-ink" size={32} />
                        </motion.div>
                        <h2 className="text-3xl font-serif font-bold text-ink dark:text-white mb-2">
                            {isSignup ? 'Begin Your Journey' : 'Welcome, Seeker'}
                        </h2>
                        <p className="text-ink/60 dark:text-white/60">
                            {isSignup ? 'Create your account to consult the oracles' : 'Enter the path to your Digital Sanctum'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-white/40 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink/20 dark:text-white/20 group-focus-within:text-ink dark:group-focus-within:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-paper dark:bg-white/5 border border-ink/5 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-ink dark:text-white placeholder:text-ink/20 dark:placeholder:text-white/20 outline-none focus:border-ink/20 dark:focus:border-white/30 transition-all font-sans"
                                    placeholder="oracle@mygrimoria.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-white/40 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink/20 dark:text-white/20 group-focus-within:text-ink dark:group-focus-within:text-white transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-paper dark:bg-white/5 border border-ink/5 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-ink dark:text-white placeholder:text-ink/20 dark:placeholder:text-white/20 outline-none focus:border-ink/20 dark:focus:border-white/30 transition-all font-sans"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-ink dark:bg-white text-white dark:text-ink rounded-2xl py-5 text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-50 relative overflow-hidden group shadow-xl"
                        >
                            <span className={`flex items-center justify-center gap-2 transition-transform duration-300 ${isLoading ? 'opacity-0' : 'group-hover:-translate-x-1'}`}>
                                {isSignup ? 'Create Account' : 'Sign In'} <ArrowRight size={20} />
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white dark:text-ink" size={24} />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => { setIsSignup(!isSignup); setError(null); }}
                            className="text-sm text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-colors"
                        >
                            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <span className="font-bold underline">{isSignup ? 'Sign In' : 'Sign Up'}</span>
                        </button>
                    </div>

                    <div className="mt-8 relative pt-8 border-t border-ink/5 dark:border-white/5">
                        <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-ink px-4 text-[10px] uppercase tracking-widest font-bold opacity-30">Or continue with</p>

                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center p-4 rounded-2xl bg-paper dark:bg-white/5 border border-ink/5 dark:border-white/10 hover:border-ink/20 dark:hover:border-white/20 transition-all"
                            >
                                <FcGoogle size={24} />
                            </button>
                            <button
                                onClick={() => handleSocialLogin('apple')}
                                className="flex items-center justify-center p-4 rounded-2xl bg-paper dark:bg-white/5 border border-ink/5 dark:border-white/10 hover:border-ink/20 dark:hover:border-white/20 transition-all"
                            >
                                <FaApple className="text-ink dark:text-white" size={24} />
                            </button>
                            <button
                                onClick={() => handleSocialLogin('azure')}
                                className="flex items-center justify-center p-4 rounded-2xl bg-paper dark:bg-white/5 border border-ink/5 dark:border-white/10 hover:border-ink/20 dark:hover:border-white/20 transition-all"
                            >
                                <FaMicrosoft size={24} className="text-[#00a4ef]" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
