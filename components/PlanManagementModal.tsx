
import React, { useState } from 'react';
import type { PortfolioPlan, PortfolioPlanStatus, Payment, Bid } from '../types';

interface PlanManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: PortfolioPlan;
    onUpdatePlan: (updatedPlan: PortfolioPlan) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const PlanManagementModal: React.FC<PlanManagementModalProps> = ({ isOpen, onClose, plan, onUpdatePlan }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'status' | 'financial'>('details');
    
    // Editing State
    const [planName, setPlanName] = useState(plan.planName);
    const [status, setStatus] = useState<PortfolioPlanStatus>(plan.status);
    
    // Payment State
    const [newPaymentAmount, setNewPaymentAmount] = useState<number | ''>('');
    
    // Bid State
    const [newBidAmount, setNewBidAmount] = useState<number | ''>('');
    const [newBidStatus, setNewBidStatus] = useState<'Pendente' | 'Aceito' | 'Recusado'>('Pendente');

    const handleSaveDetails = () => {
        const updatedPlan: PortfolioPlan = {
            ...plan,
            planName,
            status
        };
        onUpdatePlan(updatedPlan);
        onClose();
    };

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPaymentAmount || typeof newPaymentAmount !== 'number') return;

        const today = new Date().toLocaleDateString('pt-BR');
        const newPayment: Payment = {
            date: today,
            amount: newPaymentAmount,
            type: 'Parcela'
        };

        // Calculate new totals
        const newPaidAmount = plan.paidAmount + newPaymentAmount;
        const totalCost = plan.assetValue * (1 + plan.adminFee);
        const newPaidPercentage = newPaidAmount / totalCost;
        
        const updatedPlan: PortfolioPlan = {
            ...plan,
            paidAmount: newPaidAmount,
            paidPercentage: newPaidPercentage,
            paymentHistory: [newPayment, ...plan.paymentHistory],
            installmentsPaid: plan.installmentsPaid + 1
        };

        onUpdatePlan(updatedPlan);
        setNewPaymentAmount('');
    };

    const handleAddBid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBidAmount || typeof newBidAmount !== 'number') return;

        const today = new Date().toLocaleDateString('pt-BR');
        const newBid: Bid = {
            date: today,
            amount: newBidAmount,
            status: newBidStatus
        };

        const updatedPlan: PortfolioPlan = {
            ...plan,
            bidHistory: [newBid, ...plan.bidHistory]
        };

        onUpdatePlan(updatedPlan);
        setNewBidAmount('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col transform transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
                <header className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerenciar Plano</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{plan.planName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <nav className="flex px-4 gap-4" aria-label="Tabs">
                        {['details', 'status', 'financial'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
                                    activeTab === tab 
                                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                {tab === 'details' ? 'Detalhes' : tab === 'status' ? 'Status' : 'Financeiro'}
                            </button>
                        ))}
                    </nav>
                </div>

                <main className="p-5 overflow-y-auto flex-grow">
                    {activeTab === 'details' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome do Plano (Apelido)</label>
                                <input 
                                    type="text" 
                                    value={planName} 
                                    onChange={(e) => setPlanName(e.target.value)} 
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Provedor</label>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{plan.provider}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Categoria</label>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{plan.category}</div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Crédito</label>
                                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(plan.assetValue)}</div>
                                </div>
                                 <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Contrato</label>
                                    <div className="text-sm font-mono text-gray-600 dark:text-gray-300">#8392-B</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div className="space-y-6">
                             <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700/50 flex gap-3">
                                <div className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </div>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    A alteração manual de status deve ser usada apenas se a sincronização automática falhar.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Situação Atual</label>
                                <div className="relative">
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value as PortfolioPlanStatus)}
                                        className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl py-3 px-4 text-base focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                    >
                                        <option value="Ativa">Ativa (Em Pagamento)</option>
                                        <option value="Contemplada">Contemplada (Crédito Disponível)</option>
                                        <option value="Quitada">Quitada (Finalizada)</option>
                                        <option value="À Venda">À Venda</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 dark:text-gray-300">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="space-y-8">
                            {/* Register Payment */}
                            <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                    Registrar Pagamento de Parcela
                                </h4>
                                <form onSubmit={handleAddPayment} className="flex gap-3">
                                    <input 
                                        type="number" 
                                        placeholder="Valor (R$)"
                                        value={newPaymentAmount}
                                        onChange={(e) => setNewPaymentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                        className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-transform">
                                        Confirmar
                                    </button>
                                </form>
                            </section>

                            {/* Register Bid */}
                             <section className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                                    Registrar/Simular Lance
                                </h4>
                                <form onSubmit={handleAddBid} className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                         <input 
                                            type="number" 
                                            placeholder="Valor do Lance (R$)"
                                            value={newBidAmount}
                                            onChange={(e) => setNewBidAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                         <select 
                                            value={newBidStatus}
                                            onChange={(e) => setNewBidStatus(e.target.value as any)}
                                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Pendente">Pendente</option>
                                            <option value="Recusado">Recusado</option>
                                            <option value="Aceito">Aceito</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-transform">
                                        Adicionar ao Histórico
                                    </button>
                                </form>
                            </section>
                        </div>
                    )}
                </main>

                {(activeTab === 'details' || activeTab === 'status') && (
                    <footer className="p-5 border-t border-gray-200 dark:border-gray-700 flex flex-shrink-0 gap-3">
                        <button onClick={onClose} className="flex-1 py-3.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm font-bold transition-colors">Cancelar</button>
                        <button onClick={handleSaveDetails} className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-600/20">Salvar Alterações</button>
                    </footer>
                )}
            </div>
        </div>
    );
};
