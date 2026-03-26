import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeProvider } from '../../context/ThemeContext';

export const Layout: React.FC = () => {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col transition-colors duration-300">
                <Header />
                <main className="flex-grow">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
};
