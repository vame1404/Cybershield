import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Signup() {
    const { signup, loginWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await signup(email, password, name);
            navigate('/');
        } catch (err) {
            setError('Failed to create account: ' + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Failed to sign up with Google: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card p-8 rounded-2xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Shield className="w-12 h-12 text-cyber-secondary mx-auto mb-4" />
                    <h2 className="text-3xl font-display font-bold text-cyber-text">Request Access</h2>
                    <p className="text-cyber-muted mt-2">Establish new operative identity</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-cyber-muted text-sm mb-1">Codename / Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-cyber-muted" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-cyber-bg border border-cyber-border rounded-lg py-2 pl-10 pr-4 text-cyber-text focus:outline-none focus:border-cyber-secondary transition-colors"
                                placeholder="Neo"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-cyber-muted text-sm mb-1">Email Sequence</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-cyber-muted" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-cyber-bg border border-cyber-border rounded-lg py-2 pl-10 pr-4 text-cyber-text focus:outline-none focus:border-cyber-secondary transition-colors"
                                placeholder="operative@cybershield.net"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-cyber-muted text-sm mb-1">Secure Passcode</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-cyber-muted" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-cyber-bg border border-cyber-border rounded-lg py-2 pl-10 pr-4 text-cyber-text focus:outline-none focus:border-cyber-secondary transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full py-3 rounded-lg bg-cyber-secondary text-cyber-bg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'REGISTER CLEARANCE'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-4">
                    <div className="h-px bg-cyber-border flex-1" />
                    <span className="text-cyber-muted text-sm">OR</span>
                    <div className="h-px bg-cyber-border flex-1" />
                </div>

                <button 
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    className="w-full py-3 mt-6 rounded-lg bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                <div className="mt-6 text-center text-cyber-muted text-sm">
                    Already an operative? <Link to="/login" className="text-cyber-secondary hover:underline">Initialize Uplink</Link>
                </div>
            </motion.div>
        </div>
    );
}
