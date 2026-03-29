import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CreditCard, Gift, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTokenPackages, purchaseTokens, addFreeTokens } from '../../services/api';

interface TokenPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    popular: boolean;
    description: string;
}

const cssBg = { backgroundColor: 'var(--bg)', color: 'var(--fg)' } as const;
const cssSurface = { backgroundColor: 'var(--surface)' } as const;

export default function TokensPage() {
    const { profile, refreshProfile } = useAuth();
    const [packages, setPackages] = useState<TokenPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const data = await getTokenPackages();
            setPackages(data.packages);
        } catch (err) {
            console.error('Failed to load packages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (packageId: string) => {
        setPurchasing(packageId);
        setSuccess(null);
        try {
            const result = await purchaseTokens(packageId);
            setSuccess(result.message);
            await refreshProfile();
        } catch (err) {
            console.error('Purchase failed:', err);
        } finally {
            setPurchasing(null);
        }
    };

    const handleFreeTokens = async () => {
        setPurchasing('free');
        try {
            const result = await addFreeTokens();
            setSuccess(result.message);
            await refreshProfile();
        } catch (err) {
            console.error('Failed to add free tokens:', err);
        } finally {
            setPurchasing(null);
        }
    };

    if (loading) {
        return (
            <div style={cssBg} className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <Loader2 className="animate-spin opacity-40" size={32} />
            </div>
        );
    }

    return (
        <div style={cssBg} className="min-h-[calc(100vh-80px)] py-12 px-6">
            <main className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-amber-500/10">
                            <Sparkles className="w-8 h-8 text-amber-500" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif">Acquire Tokens</h1>
                    <p className="opacity-60 max-w-md mx-auto">
                        Each consultation with the oracles requires tokens. Choose your offering below.
                    </p>
                    
                    {/* Current Balance */}
                    <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full" style={cssSurface}>
                        <CreditCard size={18} className="text-amber-500" />
                        <span className="font-mono text-lg">
                            {profile?.credits || 0} tokens available
                        </span>
                    </div>
                </div>

                {/* Packages */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.map((pkg) => (
                        <motion.div
                            key={pkg.id}
                            whileHover={{ scale: 1.02 }}
                            className={`relative rounded-2xl p-6 ${pkg.popular ? 'border-2 border-amber-500' : 'border border-ink/10 dark:border-white/10'}`}
                            style={cssSurface}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                                    Popular
                                </div>
                            )}
                            
                            <div className="text-center space-y-4">
                                <h3 className="text-xl font-serif">{pkg.name}</h3>
                                <div className="text-3xl font-bold">
                                    <span className="text-amber-500">{pkg.credits}</span>
                                    <span className="text-sm font-normal opacity-60"> tokens</span>
                                </div>
                                <p className="text-xs opacity-40">{pkg.description}</p>
                                
                                <div className="pt-4">
                                    <div className="text-2xl font-serif mb-4">${pkg.price}</div>
                                    <button
                                        onClick={() => handlePurchase(pkg.id)}
                                        disabled={purchasing !== null}
                                        className="w-full py-3 px-6 bg-ink dark:bg-white text-white dark:text-ink text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {purchasing === pkg.id ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <>Purchase</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Free Demo Option */}
                <div className="text-center pt-8 border-t border-ink/10 dark:border-white/10">
                    <p className="opacity-40 mb-4">Not ready to purchase?</p>
                    <button
                        onClick={handleFreeTokens}
                        disabled={purchasing !== null}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-ink/20 dark:border-white/20 text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-ink/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        {purchasing === 'free' ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>
                                <Gift size={16} />
                                Get 3 Free Tokens (Demo)
                            </>
                        )}
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="flex items-center gap-3 px-6 py-3 bg-green-500/90 text-white rounded-full shadow-lg">
                            <Check size={18} />
                            <span>{success}</span>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
