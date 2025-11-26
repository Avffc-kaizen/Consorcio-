
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { getAiRecommendation, RecommendedPlan } from './services/geminiService';
import type { Message, ConsorcioPlan, UserProfile, DiagnosticStep, PortfolioPlan } from './types';
import { findAvailablePlans } from './services/consorcioService';
import { initMetaTracking } from './services/metaService';
import { Navigation } from './components/Navigation';

// Lazy Load Components for Performance Optimization
const Hero = React.lazy(() => import('./components/Hero').then(module => ({ default: module.Hero })));
const ChatInterface = React.lazy(() => import('./components/ChatInterface').then(module => ({ default: module.ChatInterface })));
const DecisionPanel = React.lazy(() => import('./components/DecisionPanel').then(module => ({ default: module.DecisionPanel })));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Login = React.lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const FloatingAssistant = React.lazy(() => import('./components/FloatingAssistant').then(module => ({ default: module.FloatingAssistant })));
const DeveloperHub = React.lazy(() => import('./components/DeveloperHub').then(module => ({ default: module.DeveloperHub })));

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Persistence Helper
const usePersistedState = <T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

// Minimalist Loading Screen - Now in Navy/Gold
const LoadingScreen = () => (
  <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-300">
    <div className="relative w-16 h-16">
       <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
       <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-sm font-bold text-slate-600 uppercase tracking-widest animate-pulse">Processando Estratégia...</p>
  </div>
);

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Persistent State - Data
  const [userPortfolio, setUserPortfolio] = usePersistedState<PortfolioPlan[]>('userPortfolio', []);
  const [userProfile, setUserProfile] = usePersistedState<UserProfile>('userProfile', {});
  const [isAuthenticated, setIsAuthenticated] = usePersistedState<boolean>('isAuthenticated', false);

  // Persistent State - Session/Flow
  const [messages, setMessages] = usePersistedState<Message[]>('chatMessages', []);
  const [recommendedPlans, setRecommendedPlans] = usePersistedState<RecommendedPlan[]>('recommendedPlans', []);
  const [aiResponseText, setAiResponseText] = usePersistedState<string>('aiResponseText', '');
  const [customerProfileName, setCustomerProfileName] = usePersistedState<string>('customerProfileName', '');
  const [fetchedPlans, setFetchedPlans] = usePersistedState<ConsorcioPlan[]>('fetchedPlans', []);
  const [diagnosticStep, setDiagnosticStep] = usePersistedState<DiagnosticStep>('diagnosticStep', 'category');

  // Ephemeral State (UI only)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Forced Light Theme for "Trust" look & Init Meta Pixel
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Initialize Meta Pixel/CAPI
    initMetaTracking();
  }, []);

  // CONSULTANT PERSONA INITIALIZATION
  const initialChatMessage: Message = {
    id: '1',
    sender: 'ai',
    text: 'Seja bem-vindo à Mesa de Estratégia.\n\nSou sua Inteligência Artificial dedicada a aquisições patrimoniais. Vou analisar o mercado para encontrar o cenário matemático perfeito para seu objetivo.\n\nPara iniciarmos a consultoria, qual ativo estratégico você deseja adquirir?',
    options: [
      { text: '🏠 Imóvel (Investimento/Moradia)', payload: 'Imóvel' },
      { text: '🚗 Automóvel (Premium/Popular)', payload: 'Automóvel' },
      { text: '🚛 Pesados (Frota/Agro)', payload: 'Pesados' },
    ],
    step: 'category',
  };

  const startDiagnosis = () => {
    navigate('/chat');
    setMessages([initialChatMessage]);
    setDiagnosticStep('category');
    setUserProfile({}); // Reset profile
    setRecommendedPlans([]);
    setAiResponseText('');
    setCustomerProfileName('');
    setFetchedPlans([]);
  };

  const handleRestart = () => {
    navigate('/');
    setMessages([]);
    setRecommendedPlans([]);
    setAiResponseText('');
    setCustomerProfileName('');
    setFetchedPlans([]);
    setDiagnosticStep('category');
    setUserProfile({});
  };

  const handleLogin = () => {
      setIsAuthenticated(true);
      navigate('/dashboard');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      navigate('/');
  };

  // Function triggered when user finalizes deal on DecisionPanel (clicks WhatsApp)
  // We treat this as a "Conversion" and add the plan to their dashboard.
  const handleWhatsAppHandoff = (plan: RecommendedPlan, contactInfo: { name: string; email: string; phone: string }) => {
     
     // 1. Update User Profile with captured Lead Data
     const updatedProfile = {
         ...userProfile,
         contact: contactInfo
     };
     setUserProfile(updatedProfile);

     // 2. Convert to PortfolioPlan with "In Analysis" status
     const newAsset: PortfolioPlan = {
         ...plan,
         status: 'Em Análise (Anuência)',
         paidAmount: 0,
         paidPercentage: 0,
         installmentsPaid: 0,
         nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
         paymentHistory: [],
         bidHistory: []
     };
     
     // 3. Check if already exists to prevent duplicates
     setUserPortfolio(prev => {
        const exists = prev.some(p => p.planName === newAsset.planName && p.provider === newAsset.provider);
        return exists ? prev : [newAsset, ...prev];
     });
     
     // 4. Authenticate the lead (Account Creation Simulation)
     setIsAuthenticated(true);
     
     // 5. Redirect to Dashboard to show the "acquired" asset
     // Small delay to allow WhatsApp to open
     setTimeout(() => {
         navigate('/dashboard');
     }, 1500);
  };
  
  const handleUpdatePlan = (updatedPlan: PortfolioPlan) => {
    setUserPortfolio(prev => prev.map(p => 
        (p.planName === updatedPlan.planName && p.provider === updatedPlan.provider) ? updatedPlan : p
    ));
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  }

  const handleUserResponse = useCallback(async (response: { text?: string; payload?: any }) => {
    const userMessageText = response.text;
    // Always display user response unless it's empty
    if (userMessageText) {
       const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: userMessageText as string };
       addMessage(userMessage);
    }
    setIsLoading(true);

    let updatedProfile = { ...userProfile };
    let nextStep: DiagnosticStep = diagnosticStep;
    let nextAiMessage: Message | null = null;

    // Function to execute the final fetch logic (shared between paths)
    const executeFinalAnalysis = async (profile: UserProfile) => {
        try {
            // Fetch Plans - Instant Recall
            const plans = await findAvailablePlans(
                profile.category!, 
                profile.targetAssetValue!,
                'PF'
            );
            setFetchedPlans(plans);

            if (plans.length === 0) {
                // If strictly no plans found, try to broaden automatically or ask user
                // For now, let's inform user but try to find alternatives in the background in future
                nextAiMessage = {
                    id: (Date.now() + 2).toString(),
                    sender: 'ai',
                    text: `O mercado está extremamente competitivo para o valor exato de ${formatCurrency(profile.targetAssetValue || 0)}. Vamos ajustar levemente o alvo para encontrar grupos com alta liquidez?`,
                    step: 'target_asset'
                };
                setDiagnosticStep('target_asset');
            } else {
                 // Generate AI Analysis
                const result = await getAiRecommendation(profile, plans);
                setRecommendedPlans(result.recommendedPlans);
                setAiResponseText(result.responseText);
                setCustomerProfileName(result.customerProfileName);
                
                setDiagnosticStep('done');
                navigate('/decision');
            }
        } catch (error) {
             console.error("Error:", error);
             nextAiMessage = { id: (Date.now()).toString(), sender: 'ai', text: 'Detectei uma instabilidade na conexão com a base de dados. Vamos tentar novamente.', options: [{text: 'Reiniciar Análise', payload: 'restart'}], step: 'category' };
             setDiagnosticStep('category');
        }
    };


    try {
      switch (diagnosticStep) {
        case 'category':
          updatedProfile.category = response.payload;
          
          // NEW STEP: Income Check for Budget Safety
          nextStep = 'income_check';
          nextAiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: `Excelente. O setor de ${updatedProfile.category} apresenta ótimas oportunidades de alavancagem.\n\nPara eu calibrar a parcela ideal e garantir a aprovação do seu crédito, qual é sua renda mensal média hoje?`,
                options: [], // Free input
                step: 'income_check',
          };
          break;
          
        case 'income_check':
            const income = parseFloat(response.text?.replace(/[^\d,]/g, '').replace(',', '.') || '0');
            if (isNaN(income) || income <= 0) {
                addMessage({ id: Date.now().toString(), sender: 'ai', text: 'Por favor, digite apenas números para a renda (ex: 15.000).', step: 'income_check' });
                setIsLoading(false);
                return;
            }
            updatedProfile.monthlyIncome = income;
            
            nextStep = 'target_asset';
            nextAiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: `Renda registrada. Baseado no seu fluxo de caixa, vou filtrar grupos de alta performance.\n\nQual o valor de crédito (carta) que você busca para essa aquisição?`,
                step: 'target_asset',
            };
            break;

        case 'target_asset': 
             let assetValue = 0;
             if (response.text) {
                 const cleaned = response.text.replace(/[^\d,]/g, '').replace(',', '.');
                 assetValue = parseFloat(cleaned);
                 
                 // Smart Heuristic
                 if (!isNaN(assetValue) && assetValue > 0 && assetValue < 2000) {
                     assetValue = assetValue * 1000;
                 }
             }
             
             if (isNaN(assetValue) || assetValue <= 0) {
                addMessage({ id: Date.now().toString(), sender: 'ai', text: 'Por favor, informe o valor numérico (ex: 500.000).', step: 'target_asset' });
                setIsLoading(false);
                return;
             }
             updatedProfile.targetAssetValue = assetValue;
             
             // NEW STEP: Planning Horizon (Urgency)
             nextStep = 'planning_horizon';
             nextAiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: `Crédito de ${formatCurrency(assetValue)} definido.\n\nEstrategicamente, qual é o seu horizonte de tempo ideal para ter esse bem em mãos?`,
                options: [
                    { text: '🚀 Imediato (Preciso de Estratégia de Lance)', payload: 'imediato' },
                    { text: '📅 3 a 6 meses (Planejado)', payload: 'curto_prazo' },
                    { text: '🛡️ Longo Prazo (Construção de Patrimônio)', payload: 'longo_prazo' }
                ],
                step: 'planning_horizon',
             };
             break;

        case 'planning_horizon':
            updatedProfile.planningHorizon = response.payload;
            
            // NEW STEP: Explicit FGTS Check for Real Estate
            if (updatedProfile.category === 'Imóvel') {
                nextStep = 'fgts_check';
                nextAiMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'ai',
                    text: 'Possui saldo FGTS? Podemos utilizá-lo como "Moeda de Troca" para abater lances sem desembolsar dinheiro do caixa.',
                    options: [
                         { text: 'Não tenho / Não quero usar', payload: '0' },
                         { text: 'Sim, tenho saldo', payload: 'manual' }
                    ],
                    step: 'fgts_check'
                };
            } else {
                // Skip directly to Bid Analysis for Auto/Pesados
                 nextStep = 'bid_analysis';
                 nextAiMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'ai',
                    text: 'Para aumentarmos a probabilidade estatística de contemplação a curto prazo, você dispõe de algum recurso para oferta de lance?',
                    options: [
                        { text: 'Sim, tenho reserva (> 25%)', payload: 'alto' },
                        { text: 'Recurso médio (10-25%)', payload: 'medio' },
                        { text: 'Sem lance (Apenas Sorteio/Embutido)', payload: 'sem_lance' }
                    ],
                    step: 'bid_analysis',
                };
            }
            break;
            
        case 'fgts_check':
             if (response.payload === '0') {
                 updatedProfile.fgtsBalance = 0;
             } else if (response.text) {
                 const fgts = parseFloat(response.text.replace(/[^\d,]/g, '').replace(',', '.') || '0');
                 updatedProfile.fgtsBalance = fgts;
             }
             
             nextStep = 'bid_analysis';
             nextAiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Perfeito. Além do FGTS, existe disponibilidade de capital próprio para fortalecer a oferta de lance e antecipar a contemplação?',
                options: [
                    { text: 'Sim, tenho capital líquido', payload: 'alto' },
                    { text: 'Apenas recurso moderado', payload: 'baixo' },
                    { text: 'Somente o FGTS / Sorteio', payload: 'sem_lance' }
                ],
                step: 'bid_analysis',
            };
            break;

        case 'bid_analysis':
            updatedProfile.bidCapacity = response.payload;
            
            // REMOVED LEAD CAPTURE - GO STRAIGHT TO PROCESSING
            // Making the tool feel like a free utility, lead capture happens at the end (conversion).
            nextStep = 'processing';
            nextAiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Análise preliminar concluída. Cruzando dados com as administradoras Porto Seguro, Mapfre e Bancorbrás para encontrar sua cota ideal...',
                options: [], 
                step: 'processing'
            };

            // Execute immediately
            await executeFinalAnalysis(updatedProfile);
            break;
      }
    } catch (e) {
        console.error(e);
    }
    
    setUserProfile(updatedProfile);
    setDiagnosticStep(nextStep);
    if(nextAiMessage) {
      addMessage(nextAiMessage);
    }
    setIsLoading(false);

  }, [diagnosticStep, userProfile, navigate, fetchedPlans, setUserProfile, setFetchedPlans, setRecommendedPlans, setAiResponseText, setCustomerProfileName, setDiagnosticStep, setMessages]);


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden">
      <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <main className="flex-grow pt-20 w-full max-w-full">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Hero onStart={startDiagnosis} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/admin" element={
                isAuthenticated ? (
                    <div className="container mx-auto p-4"><DeveloperHub /></div>
                ) : (
                    <Navigate to="/login" replace />
                )
            } />
            <Route path="/chat" element={
              <div className="container mx-auto px-4 py-8 flex justify-center h-[calc(100vh-80px)]">
                <div className="w-full max-w-2xl h-full">
                  <ChatInterface
                    messages={messages}
                    onUserResponse={handleUserResponse}
                    isLoading={isLoading}
                    diagnosticStep={diagnosticStep}
                  />
                </div>
              </div>
            } />
            <Route path="/decision" element={
              <DecisionPanel 
                userProfile={userProfile}
                aiResponseText={aiResponseText}
                recommendedPlans={recommendedPlans}
                customerProfileName={customerProfileName}
                onRestart={handleRestart}
                onContractingSuccess={handleWhatsAppHandoff}
              />
            } />
            <Route path="/dashboard" element={
              isAuthenticated ? (
                  <Dashboard 
                  userProfile={userProfile}
                  portfolio={userPortfolio}
                  onStartNewAnalysis={startDiagnosis}
                  onUpdatePlan={handleUpdatePlan}
                  />
              ) : (
                  <Navigate to="/login" replace />
              )
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Floating Assistant - Only on Blueprint (Decision) Page */}
      <Suspense fallback={null}>
        <FloatingAssistant 
           isVisible={recommendedPlans.length > 0 && !isAuthenticated && location.pathname === '/decision'}
           userProfile={userProfile}
           bestPlan={recommendedPlans[0]}
        />
      </Suspense>
    </div>
  );
};

export default App;
