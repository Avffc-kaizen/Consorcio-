
import React from 'react';

const steps = [
    {
        id: 1,
        title: "Adesão Planejada",
        description: "Você escolhe o crédito e assina o contrato digital. O grupo é formado por pessoas com o mesmo objetivo.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
        id: 2,
        title: "Assembleias Mensais",
        description: "Todos os meses ocorrem sorteios e ofertas de lance. É a sua chance de antecipar a conquista.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        color: "bg-indigo-50 text-indigo-700 border-indigo-200"
    },
    {
        id: 3,
        title: "Contemplação",
        description: "Seu número foi sorteado ou seu lance venceu! A carta de crédito está liberada para uso.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        color: "bg-amber-50 text-amber-600 border-amber-200"
    },
    {
        id: 4,
        title: "Compra do Bem",
        description: "Você escolhe o bem (novo ou usado) e a administradora paga o vendedor à vista. O bem é seu!",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
        color: "bg-green-50 text-green-700 border-green-200"
    }
];

export const ConsortiumProcessTimeline: React.FC = () => {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-10 mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-green-500"></div>
            
            <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-slate-900">Mapa da Conquista</h3>
                <p className="text-slate-500 mt-2 text-lg">Entenda a jornada do seu dinheiro até a realização do sonho.</p>
            </div>

            {/* Desktop View: Horizontal Timeline */}
            <div className="hidden md:flex justify-between items-start relative">
                {/* Connecting Line */}
                <div className="absolute top-8 left-0 w-full h-1 bg-slate-100 -z-10"></div>

                {steps.map((step, index) => (
                    <div key={step.id} className="flex-1 flex flex-col items-center text-center px-4 group">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-sm mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 bg-white z-10 ${step.color.replace('bg-', 'border-').replace('text-', 'border-').split(' ')[2]}`}>
                            <div className={`${step.color} w-full h-full rounded-xl m-1 flex items-center justify-center`}>
                                {step.icon}
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-[250px]">{step.description}</p>
                        
                        {/* Connector Arrow */}
                        {index < steps.length - 1 && (
                             <div className="absolute top-8 -right-1/2 w-full h-1 hidden"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile View: Vertical Timeline */}
            <div className="md:hidden space-y-8 relative">
                 {/* Vertical Line */}
                 <div className="absolute top-4 bottom-4 left-8 w-0.5 bg-slate-200 -z-10"></div>

                 {steps.map((step) => (
                     <div key={step.id} className="flex gap-5 relative pb-4 last:pb-0">
                         <div className={`w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center border shadow-sm bg-white z-10 ${step.color.split(' ')[2]}`}>
                             <div className={`${step.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                 {step.icon}
                             </div>
                         </div>
                         <div className="pt-1">
                             <h4 className="text-lg font-bold text-slate-800">{step.title}</h4>
                             <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                         </div>
                     </div>
                 ))}
            </div>
        </div>
    );
};
