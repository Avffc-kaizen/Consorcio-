
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Link, NavLink } from 'react-router-dom';
import { Hero } from './components/Hero';
import { ChatInterface } from './components/ChatInterface';
import { DecisionPanel } from './components/DecisionPanel';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { getAiRecommendation, RecommendedPlan } from './services/geminiService';
import type { Message, ConsorcioPlan, UserProfile, DiagnosticStep, PortfolioPlan } from './types';
import { findAvailablePlans } from './services/consorcioService';

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

const App: React.FC = () => {
  const navigate = useNavigate();
  
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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  const initialChatMessage: Message = {
    id: '1',
    sender: 'ai',
    text: 'Olá! Sou sua assistente de Aquisição Estratégica. Para começar, qual tipo de bem você planeja adquirir?',
    options: [
      { text: 'Automóvel', payload: 'Automóvel' },
      { text: 'Imóvel', payload: 'Imóvel' },
      { text: 'Serviços', payload: 'Serviços' },
    ],
    step: 'category',
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'dark');
  };

  const startDiagnosis = () => {
    navigate('/chat');
    setMessages([initialChatMessage]);
    setDiagnosticStep('category');
    setUserProfile(prev => ({ contact: prev.contact })); 
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
    setUserProfile(prev => ({ contact: prev.contact })); 
  };

  const handleLogin = () => {
      setIsAuthenticated(true);
      // Mock data for demonstration if portfolio is empty
      if (userPortfolio.length === 0) {
           const today = new Date();
           const mockPlans: PortfolioPlan[] = [
             {
                provider: 'Porto Seguro',
                planName: 'Imóvel Premium 500k',
                category: 'Imóvel',
                assetValue: 500000,
                termInMonths: 180,
                monthlyInstallment: 3450.00,
                adminFee: 0.18,
                status: 'Ativa',
                paidAmount: 3450 * 12,
                paidPercentage: (3450 * 12) / (500000 * 1.18),
                installmentsPaid: 12,
                nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 15).toLocaleDateString('pt-BR'),
                paymentHistory: [],
                bidHistory: [
                    { date: '15/01/2024', amount: 85000, status: 'Recusado' },
                    { date: '15/02/2024', amount: 92000, status: 'Recusado' },
                    { date: '15/03/2024', amount: 105000, status: 'Pendente' }
                ]
             },
             {
                provider: 'Mapfre',
                planName: 'Auto Executivo BMW',
                category: 'Automóvel',
                assetValue: 350000,
                termInMonths: 80,
                monthlyInstallment: 4800.00,
                adminFee: 0.15,
                status: 'Contemplada',
                paidAmount: 4800 * 18,
                paidPercentage: (4800 * 18) / (350000 * 1.15),
                installmentsPaid: 18,
                nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 10).toLocaleDateString('pt-BR'),
                paymentHistory: [],
                bidHistory: [
                    { date: '10/01/2024', amount: 120000, status: 'Aceito' }
                ]
             },
             {
                provider: 'Porto Seguro',
                planName: 'Reforma & Design',
                category: 'Serviços',
                assetValue: 50000,
                termInMonths: 48,
                monthlyInstallment: 1250.00,
                adminFee: 0.20,
                status: 'Ativa',
                paidAmount: 1250 * 4,
                paidPercentage: (1250 * 4) / (50000 * 1.20),
                installmentsPaid: 4,
                nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 20).toLocaleDateString('pt-BR'),
                paymentHistory: [],
                bidHistory: []
             }
           ];
           setUserPortfolio(mockPlans);
      }
      navigate('/dashboard');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      navigate('/');
  };

  // This is now just a reset, as the actual conversion happens via WhatsApp
  const handleWhatsAppHandoff = () => {
     // Optional: Clear session or just stay on decision page
     // For now, we won't force a navigate, allowing them to browse more or close the tab.
     console.log("User redirected to WhatsApp");
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
    if (diagnosticStep !== 'contact' && userMessageText) {
       const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: userMessageText as string };
       addMessage(userMessage);
    }
    setIsLoading(true);

    let updatedProfile = { ...userProfile };
    let nextStep: DiagnosticStep = diagnosticStep;
    let nextAiMessage: Message | null = null;

    switch (diagnosticStep) {
      case 'category':
        updatedProfile.category = response.payload;
        nextStep = 'investment';
        nextAiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Ok, ${response.payload}. Para estruturarmos o plano, qual valor de parcela mensal ficaria confortável no seu fluxo de caixa?`,
          step: 'investment',
        };
        break;
      
      case 'investment':
        const investmentValue = parseFloat(response.text || '0');
        if (isNaN(investmentValue) || investmentValue <= 0) {
           addMessage({
             id: (Date.now() + 1).toString(),
             sender: 'ai',
             text: 'Por favor, insira um valor numérico válido para o investimento mensal.',
             step: 'investment'
           });
           setIsLoading(false);
           return;
        }
        updatedProfile.investment = investmentValue;
        
        const loadingGroupsMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Entendido. Com um aporte de ${formatCurrency(investmentValue)}, estou minerando as melhores opções na Porto Seguro e Mapfre...`,
          step: 'investment',
        };
        addMessage(loadingGroupsMessage);

        try {
            const plans = await findAvailablePlans(updatedProfile.category!, investmentValue);
            setFetchedPlans(plans);

            // Optimized questions for clearer AI decision making
            const priorityOptions = [
                { text: 'Menor Custo Total (Taxa Mínima)', payload: 'Menor Custo Final' },
                { text: 'Parcela Reduzida (Fluxo)', payload: 'Parcela Reduzida' },
                { text: 'Contemplação Rápida (Lance)', payload: 'Velocidade' }
            ];

            if (plans.length === 0) {
              nextAiMessage = {
                id: (Date.now() + 2).toString(),
                sender: 'ai',
                text: 'Não encontrei grupos exatos para esse valor, mas posso montar estratégias similares. O que é inegociável para você neste momento?',
                options: priorityOptions,
                step: 'priority',
              };
            } else {
               nextAiMessage = {
                id: (Date.now() + 2).toString(),
                sender: 'ai',
                text: 'Localizei grupos com excelente potencial. Para refinar o comparativo entre Porto Seguro e Mapfre, qual é o fator decisivo para você?',
                options: priorityOptions,
                step: 'priority',
              };
            }
        } catch (error) {
            console.error("Error finding available plans:", error);
            nextAiMessage = {
              id: (Date.now() + 2).toString(),
              sender: 'ai',
              text: 'Tive um problema ao consultar os sistemas dos parceiros. Vamos prosseguir com base no seu perfil. O que você prioriza?',
              options: [ { text: 'Menor Custo', payload: 'Economia' }, { text: 'Velocidade', payload: 'Velocidade' } ],
              step: 'priority',
            };
        }
        nextStep = 'priority';
        break;

      case 'priority':
        updatedProfile.priority = response.payload;
        nextStep = 'contact';
        nextAiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Perfeito. Já desenhei 3 cenários estratégicos para você comparar. Por favor, informe seus dados para liberar o acesso ao painel comparativo.',
          step: 'contact',
        };
        break;
      
      case 'contact':
        updatedProfile.contact = response.payload;
        nextStep = 'done';
        addMessage({ id: (Date.now() + 1).toString(), sender: 'ai', text: 'Gerando comparativo de seguradoras e estratégias de lance...' });

        try {
          const result = await getAiRecommendation(updatedProfile, fetchedPlans);
          setRecommendedPlans(result.recommendedPlans);
          setAiResponseText(result.responseText);
          setCustomerProfileName(result.customerProfileName);
          navigate('/decision');
        } catch (error) {
           console.error('Error fetching AI recommendation:', error);
           addMessage({ id: (Date.now() + 2).toString(), sender: 'ai', text: 'Desculpe, ocorreu um erro ao gerar seu plano. Por favor, tente novamente.' });
        }
        break;
    }
    
    setUserProfile(updatedProfile);
    setDiagnosticStep(nextStep);
    if(nextAiMessage) {
      addMessage(nextAiMessage);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [diagnosticStep, userProfile, navigate, fetchedPlans, setUserProfile, setFetchedPlans, setRecommendedPlans, setAiResponseText, setCustomerProfileName, setDiagnosticStep, setMessages]);


  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-10 transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-cyan-600 dark:text-cyan-400 hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417V21h18v-.583c0-3.46-2.29-6.417-5.382-7.433z" />
            </svg>
            <span className="hidden md:inline">Ecossistema de Alavancagem</span>
            <span className="md:hidden">EAP</span>
          </Link>

          <div className="flex items-center gap-4">
              <nav>
                  {isAuthenticated ? (
                      <div className="flex items-center gap-4">
                           <NavLink 
                                to="/dashboard"
                                className={({ isActive }) => 
                                    `text-sm font-semibold transition-colors pb-1 ${
                                        isActive 
                                        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500' 
                                        : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400'
                                    }`
                                }
                            >
                                Meu Painel
                            </NavLink>
                            <button 
                                onClick={handleLogout}
                                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                            >
                                Sair
                            </button>
                      </div>
                  ) : (
                      <Link 
                        to="/login"
                        className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                         Área do Cliente
                      </Link>
                  )}
              </nav>
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </button>
            </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Hero onStart={startDiagnosis} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
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
      </main>
    </div>
  );
};

export default App;
