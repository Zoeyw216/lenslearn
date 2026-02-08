
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Loader2, BookOpen } from 'lucide-react';

const AuthPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Verification link sent. Please check your inbox.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Authentication failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-8 pt-20 pb-12">
            <div className="w-full max-w-[340px] flex flex-col items-center">

                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 border border-gray-900 rounded-full flex items-center justify-center mb-10">
                        <BookOpen size={32} strokeWidth={1.5} className="text-gray-900" />
                    </div>
                    <h1 className="text-[28px] font-light tracking-[0.3em] text-gray-900 uppercase">
                        LensLearn
                    </h1>
                </div>

                {/* Hero Image */}
                <div className="w-full aspect-[1.8/1] rounded-[24px] overflow-hidden mb-16 shadow-sm">
                    <img
                        src="/auth-hero.png"
                        alt="LensLearn Aesthetic"
                        className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                    />
                </div>

                {/* Auth Form */}
                <form onSubmit={handleAuth} className="w-full flex flex-col">

                    <div className="mb-8">
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-3">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="hello@lenslearn.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full py-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-900 transition-colors text-sm placeholder:text-gray-200"
                        />
                    </div>

                    <div className="mb-10">
                        <label className="block text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-3">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-900 transition-colors text-sm placeholder:text-gray-200"
                        />
                    </div>

                    {message && (
                        <div className={`mb-6 text-center text-[11px] font-bold uppercase tracking-widest ${message.type === 'error' ? 'text-red-500' : 'text-gray-900'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#121214] text-white py-5 rounded-xl font-bold text-sm tracking-wide shadow-lg active:scale-[0.98] transition-all disabled:bg-gray-300 mb-6"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>

                    {!isSignUp && (
                        <button type="button" className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold hover:text-gray-900 transition-colors text-center">
                            Forgot Password?
                        </button>
                    )}
                </form>

                {/* Divider & Toggle */}
                <div className="w-full mt-auto pt-24">
                    <div className="relative flex items-center justify-center mb-8">
                        <div className="w-full border-t border-gray-100"></div>
                        <span className="absolute px-4 bg-white text-[10px] uppercase tracking-[0.15em] text-gray-300 font-bold">
                            Or
                        </span>
                    </div>

                    <p className="text-center text-[12px] text-gray-400 font-medium">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-gray-900 font-bold underline decoration-1 underline-offset-4"
                        >
                            {isSignUp ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
