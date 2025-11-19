
import React, { useState } from 'react';
import type { MarketplaceListing, Proposal } from '../types';
import { TransactionStatusTracker } from './TransactionStatusTracker';
import { ProposalModal } from './ProposalModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

const InfoItem: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`font-semibold text-gray-800 dark:text-white ${className}`}>{value}</p>
    </div>
);

interface MarketplaceListingCardProps {
    listing: MarketplaceListing;
    onMakeProposal: (listingId: string, proposal: Proposal) => void;
}

export const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({ listing, onMakeProposal }) => {
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const isInTransaction = listing.listingStatus === 'Negociação Iniciada';

    const handleProposalSubmit = (proposal: Proposal) => {
        onMakeProposal(listing.id, proposal);
        setIsProposalModalOpen(false);
    }

    return (
        <>
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative ${isInTransaction ? 'hover:border-gray-700' : 'hover:border-cyan-400 dark:hover:border-cyan-500'}`}>
            
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex-grow">
                     <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{listing.plan.provider} - {listing.plan.category}</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{listing.plan.planName}</h3>
                    <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">{formatCurrency(listing.plan.assetValue)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vendido por: {listing.sellerName}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 w-full md:w-auto">
                    <InfoItem label="Parcela" value={formatCurrency(listing.plan.monthlyInstallment)} />
                    <InfoItem label="Prazo" value={`${listing.plan.termInMonths} meses`} />
                    <InfoItem label="Cota Paga" value={formatPercent(listing.paidPercentage)} className="text-cyan-600 dark:text-cyan-400" />
                    <InfoItem label="Taxa Adm." value={formatPercent(listing.plan.adminFee)} />
                </div>
            </div>
            
            {isInTransaction && listing.proposal && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <TransactionStatusTracker proposal={listing.proposal} />
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-grow">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Preço Pedido</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(listing.askingPrice)}</p>
                        <div className="px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                           Lucro de {formatPercent(listing.profitPercentage)}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setIsProposalModalOpen(true)}
                    disabled={isInTransaction}
                    className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-md transition-colors flex-shrink-0 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isInTransaction ? 'Negociação em Andamento' : 'Fazer Proposta'}
                </button>
            </div>
        </div>

        {isProposalModalOpen && (
            <ProposalModal
                isOpen={isProposalModalOpen}
                onClose={() => setIsProposalModalOpen(false)}
                listing={listing}
                onSubmitProposal={handleProposalSubmit}
            />
        )}
        </>
    );
};