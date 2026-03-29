import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export const Header: React.FC = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { isLoggedIn, logout, profile } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className={`relative transition-all duration-300 z-50 ${isMenuOpen
            ? "bg-white dark:bg-ink shadow-lg"
            : "bg-white/80 dark:bg-ink/80 backdrop-blur-md border-b border-ink/5 dark:border-white/5"
            }`}>
            <div className="flex items-center justify-between w-full max-w-[1400px] mx-auto min-h-[80px] px-6 lg:px-12">
                {/* Logo - Left Side (flex-1 for symmetry) */}
                <div className="flex-1">
                    <Link
                        to="/"
                        className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <div className="zen-logo-icon">
                            <img src={logo} alt="My Grimoria Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="zen-logo-title">MY GRIMORIA</h1>
                    </Link>
                </div>

                {/* Desktop Navigation - Center */}
                <nav className="hidden md:flex items-center gap-10 justify-center">
                    <Link to="/" className={`zen-nav-link ${isActive('/') ? 'zen-nav-link-active' : ''}`}>Home</Link>
                    <Link to="/blog" className={`zen-nav-link ${isActive('/blog') ? 'zen-nav-link-active' : ''}`}>Blog</Link>
                    <Link to="/oracle" className={`zen-nav-link ${isActive('/oracle') || isActive('/oracle/iching') ? 'zen-nav-link-active' : ''}`}>Oracle</Link>
                    {isLoggedIn && (
                        <>
                            <Link to="/tokens" className={`zen-nav-link ${isActive('/tokens') ? 'zen-nav-link-active' : ''}`}>Tokens</Link>
                            <Link to="/sanctum" className={`zen-nav-link ${isActive('/sanctum') ? 'zen-nav-link-active' : ''}`}>Sanctum</Link>
                            <Link to="/profile" className={`zen-nav-link ${isActive('/profile') ? 'zen-nav-link-active' : ''}`}>Profile</Link>
                        </>
                    )}
                </nav>

                {/* Actions - Right Side (flex-1 for symmetry) */}
                <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                    </button>

                    {/* Desktop Login/Logout/Profile - Only shown on Desktop */}
                    <div className="hidden md:flex items-center gap-6">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-6">
                                {profile && (
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] tracking-[0.2em] uppercase opacity-40 font-bold">Level</span>
                                            <span className="text-sm font-serif italic font-bold">{profile.level}</span>
                                        </div>
                                        <div className="w-24 h-1 bg-ink/5 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-ink dark:bg-white transition-all duration-1000"
                                                style={{ width: `${(profile.xp % 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                <button onClick={logout} className="zen-btn-primary">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="zen-btn-primary">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Hamburger Button - Only on Mobile */}
                    <button
                        className="md:hidden p-2.5 rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors z-[70] ml-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Background dim for depth */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-ink/40 dark:bg-black/60 z-[55] md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Solid Menu Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-0 top-[80px] z-[60] bg-white dark:bg-ink flex flex-col p-8 pt-12 md:hidden overflow-y-auto"
                        >
                            <nav className="flex flex-col gap-10 text-center mb-12">
                                <Link
                                    to="/"
                                    className={`text-4xl font-serif ${isActive('/') ? 'opacity-100 font-bold' : 'opacity-40'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/blog"
                                    className={`text-4xl font-serif ${isActive('/blog') ? 'opacity-100 font-bold' : 'opacity-40'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Blog
                                </Link>
                                <Link
                                    to="/oracle"
                                    className={`text-4xl font-serif ${isActive('/oracle') ? 'opacity-100 font-bold' : 'opacity-40'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Oracle
                                </Link>
                                {isLoggedIn && (
                                    <>
                                        <Link
                                            to="/sanctum"
                                            className={`text-4xl font-serif ${isActive('/sanctum') ? 'opacity-100 font-bold' : 'opacity-40'}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sanctum
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className={`text-4xl font-serif ${isActive('/profile') ? 'opacity-100 font-bold' : 'opacity-40'}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                    </>
                                )}
                            </nav>

                            <hr className="border-ink/5 dark:border-white/5 mb-10" />

                            <div className="flex flex-col items-center pb-12">
                                {isLoggedIn ? (
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="zen-btn-primary w-full max-w-sm py-6 text-xl shadow-lg"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="zen-btn-primary w-full max-w-sm py-6 text-xl shadow-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};
