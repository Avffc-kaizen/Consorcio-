
import React from 'react';
import type { Proposal, OrchestrationStatus } from '../types';

interface TransactionStatusTrackerProps {
    proposal: Proposal;
}

const statusToStepMap: Record<OrchestrationStatus, number> = {
    'dossie_concluido': 1,
    'enviado_administradora': 2,
    'anuencia_aprovada': 3,
    'transferencia_concluida': 4,
};


export const TransactionStatusTracker: React.FC<TransactionStatusTrackerProps> = ({ proposal }) => {
    const steps = [
        { id: 1, name: 'Dossiê do Comprador', description: 'Dados validados via Open Finance.' },
        { id: 2, name: 'Enviado p/ Administradora', description: 'Aguardando análise da Porto Seguro.' },
        { id: 3, name: 'Anuência', description: 'Aguardando aprovação da transferência.' },
        { id: 4, name: 'Ativo Adquirido & Transferido', description: 'Formalização concluída com sucesso.' },
    ];
    
    const currentStep = statusToStepMap[proposal.orchestrationStatus] || 0;


    return (
        <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Rastreador de Orquestração</h4>
            <nav aria-label="Progress">
                <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                    {steps.map((step) => {
                        const isCompleted = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;

                        if (isCompleted) {
                            return (
                                <li key={step.name} className="md:flex-1">
                                    <div className="group flex flex-col border-l-4 border-cyan-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                        <span className="text-sm font-medium text-cyan-600 flex items-center">
                                            {step.name}
                                            {currentStep === 4 && step.id === 4 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{step.description}</span>
                                    </div>
                                </li>
                            );
                        } else if (isCurrent) {
                            return (
                                <li key={step.name} className="md:flex-1">
                                    <div className="group flex flex-col border-l-4 border-cyan-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0" aria-current="step">
                                        <span className="text-sm font-medium text-cyan-600">{step.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{step.description}</span>
                                    </div>
                                </li>
                            );
                        } else { // Upcoming
                             return (
                                <li key={step.name} className="md:flex-1">
                                    <div className="group flex flex-col border-l-4 border-gray-200 dark:border-gray-700 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{step.name}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{step.description}</span>
                                    </div>
                                </li>
                             )
                        }
                    })}
                </ol>
            </nav>
        </div>
    );
};
