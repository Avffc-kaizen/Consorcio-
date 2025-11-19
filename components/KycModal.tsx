
import React, { useState } from 'react';
import type { UserVerificationStatus } from '../types';

interface KycModalProps {
    onClose: () => void;
    onStartKyc: () => void;
    status: UserVerificationStatus;
}

export const KycModal: React.FC<KycModalProps> = ({ onClose, onStartKyc, status }) => {

    const renderContent = () => {
        switch (status) {
            case 'pending':
                return (
                    <div className="text-center p-8">
                        <svg className="animate-spin mx-auto h-12 w-12 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold">Analisando Documentos</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Nossa equipe está validando suas informações. Isso geralmente leva alguns minutos.</p>
                    </div>
                );
            case 'verified':
                 return (
                    <div className="text-center p-8">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="mt-4 text-2xl font-bold text-green-600 dark:text-green-400">Identidade Verificada!</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Você já pode comprar e vender no marketplace com segurança.</p>
                    </div>
                );
            case 'unverified':
            default:
                return (
                    <div className="p-6 space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">Para garantir a segurança de todas as transações, precisamos verificar sua identidade. Este é um requisito do Banco Central para marketplaces financeiros.</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Documento de Identidade (Frente e Verso)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Arraste e solte ou clique para carregar</p>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Selfie com Documento</label>
                                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Carregue uma foto sua segurando o documento.</p>
                                 </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verificação de Identidade (KYC)</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                {renderContent()}
                <footer className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-md transition-colors">
                        {status === 'unverified' ? 'Cancelar' : 'Fechar'}
                    </button>
                    {status === 'unverified' && (
                        <button onClick={onStartKyc} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                            Enviar para Análise
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};
