
import React, { useState } from 'react';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate network delay for auth
        setTimeout(() => {
            setIsLoading(false);
            onLogin();
        }, 1000);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row animate-in fade-in duration-500">
            {/* Left Side - Branding */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <svg className="h-full w-full text-cyan-900" viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="relative z-10 p-12 text-center">
                    <h1 className="text-4xl font-extrabold text-white mb-4">Ecossistema de Alavancagem</h1>
                    <p className="text-lg text-gray-300 max-w-md mx-auto">
                        Gerencie seu portfólio de ativos, acompanhe assembleias e projete seu crescimento patrimonial em um só lugar.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Acesse sua Conta</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Entre para gerenciar seus ativos.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="mt-1 w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input id="remember-me" type="checkbox" className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-900 dark:text-gray-300">Lembrar-me</label>
                            </div>
                            <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">Esqueceu a senha?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Entrar no Painel'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
