
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Hero } from './components/Hero';
import { ChatInterface } from './components/ChatInterface';
import { DecisionPanel } from './components/DecisionPanel';
import { getAiRecommendation, RecommendedPlan } from './services/geminiService';
import type { Message, ConsorcioPlan, UserProfile, DiagnosticStep } from './types';
import { getAllAvailablePlans } from './services/consorcioService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'hero' | 'chat' | 'decisionPanel'>('hero');
  const [messages, setMessages] = useState<Message[]>([]);
  const [recommendedPlans, setRecommendedPlans] = useState<RecommendedPlan[]>([]);
  const [aiResponseText, setAiResponseText] = useState('');
  const [customerProfileName, setCustomerProfileName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const availablePlansRef = useRef<ConsorcioPlan[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [diagnosticStep, setDiagnosticStep] = useState<DiagnosticStep>('category');

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
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await getAllAvailablePlans();
        availablePlansRef.current = plans;
        setPlansLoaded(true);
      } catch (error) {
        console.error("Failed to load consortium plans:", error);
        // Here you could set an error state and display a message to the user
      }
    };
    loadPlans();
  }, []);

  const startDiagnosis = () => {
    setAppState('chat');
    setMessages([initialChatMessage]);
    setDiagnosticStep('category');
    setUserProfile({});
  };

  const handleRestart = () => {
    setAppState('hero');
    setMessages([]);
    setRecommendedPlans([]);
    setAiResponseText('');
    setCustomerProfileName('');
    setUserProfile({});
    setDiagnosticStep('category');
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
        nextStep = 'assetValue';

        let valueOptions: { text: string; payload: string }[] = [];
        let questionText = '';

        switch (response.payload) {
            case 'Automóvel':
                questionText = 'Entendido. Qual a faixa de valor para o veículo?';
                valueOptions = [
                    { text: 'R$ 30k a R$ 70k', payload: 'R$ 30.000 a R$ 70.000' },
                    { text: 'R$ 70k a R$ 120k', payload: 'R$ 70.001 a R$ 120.000' },
                    { text: 'R$ 120k a R$ 200k', payload: 'R$ 120.001 a R$ 200.000' },
                ];
                break;
            case 'Imóvel':
                questionText = 'Certo. E qual a faixa de valor para o imóvel?';
                valueOptions = [
                    { text: 'R$ 200k a R$ 400k', payload: 'R$ 200.000 a R$ 400.000' },
                    { text: 'R$ 400k a R$ 700k', payload: 'R$ 400.001 a R$ 700.000' },
                    { text: 'R$ 700k a R$ 1kk', payload: 'R$ 700.001 a R$ 1.000.000' },
                ];
                break;
            case 'Serviços':
                questionText = 'Ok. Qual a faixa de valor para o serviço?';
                valueOptions = [
                    { text: 'R$ 10k a R$ 20k', payload: 'R$ 10.000 a R$ 20.000' },
                    { text: 'R$ 20k a R$ 30k', payload: 'R$ 20.001 a R$ 30.000' },
                ];
                break;
        }

        nextAiMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: questionText,
            options: valueOptions,
            step: 'assetValue',
        };
        break;

      case 'assetValue':
        updatedProfile.assetValueRange = response.payload;
        nextStep = 'investment';
        nextAiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Entendido. E qual valor de investimento mensal se encaixa no seu planejamento?',
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
        nextStep = 'priority';
        nextAiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Perfeito. Esta é a pergunta mais importante: Qual é a sua prioridade?',
          options: [
            { text: 'Velocidade', payload: 'Velocidade' },
            { text: 'Economia', payload: 'Economia' },
            { text: 'Alavancagem', payload: 'Alavancagem' },
          ],
          step: 'priority',
        };
        break;

      case 'priority':
        updatedProfile.priority = response.payload;
        nextStep = 'contact';
        nextAiMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Ótimo. Seu Plano Estratégico está quase pronto. Por favor, informe seus dados para desbloquear seu painel de decisão pessoal.',
          step: 'contact',
        };
        break;
      
      case 'contact':
        updatedProfile.contact = response.payload;
        nextStep = 'done';
        addMessage({ id: (Date.now() + 1).toString(), sender: 'ai', text: 'Analisando as melhores estratégias para o seu perfil... Por favor, aguarde.' });

        try {
          const result = await getAiRecommendation(updatedProfile, availablePlansRef.current);
          setRecommendedPlans(result.recommendedPlans);
          setAiResponseText(result.responseText);
          setCustomerProfileName(result.customerProfileName);
          setAppState('decisionPanel');
        } catch (error) {
           console.error('Error fetching AI recommendation:', error);
           addMessage({ id: (Date.now() + 2).toString(), sender: 'ai', text: 'Desculpe, ocorreu um erro ao gerar seu plano. Por favor, tente novamente.' });
        }
        break;
    }
    
    setUserProfile(updatedProfile);
    setDiagnosticStep(nextStep);
    if(nextAiMessage) {
      setTimeout(() => { // simulate AI thinking
        addMessage(nextAiMessage);
        setIsLoading(false);
      }, 500);
    } else {
        setIsLoading(false);
    }
  }, [diagnosticStep, userProfile]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417V21h18v-.583c0-3.46-2.29-6.417-5.382-7.433z" />
            </svg>
            Aquisição Estratégica de Ativos
          </h1>
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {appState === 'hero' && <Hero onStart={startDiagnosis} plansLoaded={plansLoaded} />}
        {appState === 'chat' && (
          <div className="container mx-auto px-4 py-8 flex justify-center">
            <div className="w-full max-w-2xl">
               <ChatInterface
                messages={messages}
                onUserResponse={handleUserResponse}
                isLoading={isLoading}
                diagnosticStep={diagnosticStep}
              />
            </div>
          </div>
        )}
        {appState === 'decisionPanel' && (
           <DecisionPanel 
             userProfile={userProfile}
             aiResponseText={aiResponseText}
             recommendedPlans={recommendedPlans}
             customerProfileName={customerProfileName}
             onRestart={handleRestart}
           />
        )}
      </main>
    </div>
  );
};

export default App;