
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  PortoClient,
  PORTO_PRODUCTION_ENDPOINT,
  SOAP_ACTION_HEADER,
  SoapError,
  MOCK_LISTAR_ARQUIVOS_RESPONSE,
  type PortoFile,
  type PortoFileContent
} from '../services/portoSoapClient';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            active
                ? 'bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
        }`}
    >
        {children}
    </button>
);

const IntegrationDebugger = () => {
  const [susep, setSusep] = useState('12345');
  const [token, setToken] = useState('TEST_TOKEN_ABC');
  const [password, setPassword] = useState('TestPassword');
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(`${today}T00:00:00`);
  const [endDate, setEndDate] = useState(`${today}T23:59:59`);

  const [activeTab, setActiveTab] = useState<'results' | 'request' | 'response'>('results');
  const [requestXml, setRequestXml] = useState('');
  const [responseXml, setResponseXml] = useState('');
  const [availableFiles, setAvailableFiles] = useState<PortoFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState<PortoFileContent | null>(null);
  const [soapError, setSoapError] = useState<SoapError | null>(null);

  const handleListFiles = async () => {
    setIsLoading(true);
    setResponseXml('');
    setAvailableFiles([]);
    setDownloadedFile(null);
    setSoapError(null);
    setActiveTab('results');

    // Instantiate client with mock enabled by default
    const client = new PortoClient(PORTO_PRODUCTION_ENDPOINT, true);

    try {
        const { xmlRequest, files } = await client.listarArquivos({ susep, login: token, senha: password });
        setRequestXml(xmlRequest);
        setAvailableFiles(files);
        // In a simulation, we use the mock response for visualization if successful
        setResponseXml(MOCK_LISTAR_ARQUIVOS_RESPONSE);

    } catch (error) {
        if (error instanceof SoapError) {
            setSoapError(error);
            setRequestXml('<!-- Request available in network tab -->'); // Simplified for error case
            setResponseXml(MOCK_LISTAR_ARQUIVOS_RESPONSE); // Showing mock response that triggered error logic
        } else {
            setRequestXml('N/A');
            setResponseXml(`Erro Inesperado: ${error instanceof Error ? error.message : String(error)}`);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleDownloadFile = async (fileId: number) => {
    setIsLoading(true);
    setDownloadedFile(null);
    setSoapError(null);

    const client = new PortoClient(PORTO_PRODUCTION_ENDPOINT, true);

    try {
        const { xmlRequest, content } = await client.recuperarConteudo({ susep, login: token, senha: password }, fileId);
        setRequestXml(xmlRequest);
        setDownloadedFile(content);
        setResponseXml("Simulated Download Response (See Results Tab)");
        setActiveTab('results');

    } catch (error) {
         if (error instanceof SoapError) {
            setSoapError(error);
            setRequestXml('<!-- Request available in network tab -->');
            setResponseXml('<!-- SOAP Fault Received -->');
        } else {
            setRequestXml('N/A');
            setResponseXml(`Erro Inesperado: ${error instanceof Error ? error.message : String(error)}`);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const simulateError = () => {
    setSusep('ERROR');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            Porto Integration Debugger (SOAP)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Simulate SOAP requests for CentralDownloadsIntegrationService.</p>
      </div>
      
      <div className="p-6 space-y-6">
        {soapError && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <h4 className="font-bold text-red-800 dark:text-red-200">SOAP Fault Detectado</h4>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">A API da Porto Seguro retornou um erro SOAP.</p>
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded text-xs font-mono text-red-900 dark:text-red-100">
                    <p><strong>FaultCode:</strong> {soapError.faultCode}</p>
                    <p><strong>FaultString:</strong> {soapError.faultString}</p>
                    <p><strong>Detail:</strong> {soapError.detail || 'N/A'}</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Credentials Panel */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600 space-y-4">
            <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 000-2z" clipRule="evenodd" /></svg>
                Credentials & Period
            </h4>
            <input type="text" placeholder="SUSEP (Use 'ERROR' to simulate)" value={susep} onChange={(e) => setSusep(e.target.value)} className="w-full text-sm p-2 rounded border dark:bg-gray-800 dark:border-gray-600" />
            <input type="text" placeholder="Login (Token)" value={token} onChange={(e) => setToken(e.target.value)} className="w-full text-sm p-2 rounded border dark:bg-gray-800 dark:border-gray-600" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full text-sm p-2 rounded border dark:bg-gray-800 dark:border-gray-600" />
            <input type="text" placeholder="Start Period (ISO)" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm p-2 rounded border dark:bg-gray-800 dark:border-gray-600" />
            <input type="text" placeholder="End Period (ISO)" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm p-2 rounded border dark:bg-gray-800 dark:border-gray-600" />
            <div className="flex gap-2">
                <button onClick={handleListFiles} disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors disabled:opacity-50">
                    {isLoading ? 'Carregando...' : '1. Listar Arquivos'}
                </button>
                <button onClick={simulateError} className="px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Simular Erro SOAP">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
            </div>
          </div>

          {/* Network Simulation Panel */}
           <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                Network Simulation
            </h4>
            <div className="space-y-4">
                <div className='flex items-center space-x-2'>
                    <span className='px-2 py-1 bg-green-600 text-white text-xs font-bold rounded'>POST</span>
                    <span className='text-xs font-mono break-all text-gray-600 dark:text-gray-300'>{PORTO_PRODUCTION_ENDPOINT}</span>
                </div>
                <div>
                    <p className='text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300'>Request Headers:</p>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono border dark:border-gray-600">
                        {Object.entries(SOAP_ACTION_HEADER).map(([key, value]) => (
                            <p key={key} className="text-gray-600 dark:text-gray-400">{key}: <span className='text-blue-600 dark:text-blue-400'>{value || '" "'}</span></p>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Credential Mapping Panel */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                Credential Mapping
            </h4>
            <p className='text-xs mb-3 text-gray-600 dark:text-gray-400'>Como as credenciais são inseridas no Envelope SOAP:</p>
            <div className="bg-white dark:bg-gray-800 p-3 rounded text-xs font-mono border dark:border-gray-600 text-gray-500 dark:text-gray-400">
                <p>&lt;soapenv:Header&gt;</p>
                <p className='ml-4'>&lt;ws:susep&gt;<span className='text-purple-600 dark:text-purple-400'>{susep || 'SEU_SUSEP'}</span>&lt;/ws:susep&gt;</p>
                <p className='ml-4'>&lt;ws:senha&gt;<span className='text-purple-600 dark:text-purple-400'>{'*'.repeat(password.length) || 'SUA_SENHA'}</span>&lt;/ws:senha&gt;</p>
                <p className='ml-4'>&lt;ws:login&gt;<span className='text-purple-600 dark:text-purple-400'>{token || 'SEU_TOKEN'}</span>&lt;/ws:login&gt;</p>
                <p>&lt;/soapenv:Header&gt;</p>
            </div>
          </div>
        </div>

        {/* Results Tabs */}
        <div className="mt-6">
          <div className="flex gap-1">
            <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')}>Results (Parsed)</TabButton>
            <TabButton active={activeTab === 'request'} onClick={() => setActiveTab('request')}>Request XML</TabButton>
            <TabButton active={activeTab === 'response'} onClick={() => setActiveTab('response')}>Response XML (Raw)</TabButton>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-b-lg rounded-tr-lg min-h-[200px]">
            {activeTab === 'results' && (
                <div>
                    <h4 className="font-bold mb-4 text-gray-800 dark:text-white">Arquivos Disponíveis ({availableFiles.length})</h4>
                    {availableFiles.length > 0 ? (
                         <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-900">
                               <tr>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome do Arquivo</th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Geração</th>
                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ação</th>
                               </tr>
                             </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                               {availableFiles.map((file) => (
                                 <tr key={file.codigo}>
                                   <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{file.codigo}</td>
                                   <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{file.nomeArquivo}</td>
                                   <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{file.produto}</td>
                                   <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{file.dataGeracao ? new Date(file.dataGeracao).toLocaleDateString() : 'N/A'}</td>
                                   <td className="px-4 py-2 text-sm">
                                     <button className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium text-xs border border-cyan-200 dark:border-cyan-800 rounded px-2 py-1" onClick={() => handleDownloadFile(file.codigo)} disabled={isLoading}>
                                       2. Download
                                     </button>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                       </div>
                    ) : (
                        <p className='text-gray-500 dark:text-gray-400 text-sm text-center py-8'>Nenhum arquivo listado. Clique em "Listar Arquivos" para simular ou verifique se ocorreu um erro.</p>
                    )}
                    
                    {downloadedFile && (
                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                             <h5 className="font-bold text-green-800 dark:text-green-200 mb-2">Conteúdo do Arquivo Baixado</h5>
                             <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Arquivo: {downloadedFile.nome} | Tamanho (Base64): {downloadedFile.conteudoBase64?.length} bytes</p>
                             <div className="bg-gray-900 text-gray-300 p-3 rounded overflow-auto max-h-40 font-mono text-xs">
                                {downloadedFile.conteudoDecodificado || 'Conteúdo vazio.'}
                             </div>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'request' && (
                 <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">{requestXml || 'Nenhuma requisição gerada ainda.'}</pre>
            )}
            {activeTab === 'response' && (
                 <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">{responseXml || 'Nenhuma resposta recebida ainda.'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CloudJobScheduler Component: Simulates a backend Cron Job (e.g., Cloud Function)
 * Enhanced with robust SOAP error logging.
 */
const CloudJobScheduler = () => {
    const [logs, setLogs] = useState<{timestamp: string, message: string, type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'}[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [schedule, setSchedule] = useState('Diariamente às 08:00 UTC');
    const [simulateFailure, setSimulateFailure] = useState(false);
    const consoleEndRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((message: string, type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prevLogs => [...prevLogs, { timestamp, message, type }]);
    }, []);

    useEffect(() => {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    const executeTask = async () => {
      setIsRunning(true);
      setLogs([]);
      addLog('Execução da tarefa acionada manualmente.');
      addLog(`Iniciando Pipeline de Extração de Dados Porto Seguro...`);

      const susep = simulateFailure ? 'ERROR' : '12345_AUTO';
      const token = 'AUTO_TOKEN';
      const password = 'AUTO_PASSWORD';

      if (simulateFailure) {
        addLog('Modo de Simulação de Falha SOAP ATIVADO. Usando credenciais de erro.', 'WARN');
      }

      const client = new PortoClient(PORTO_PRODUCTION_ENDPOINT, true);

      try {
        // Step 1: List Files
        addLog('[STEP 1] Conectando à API SOAP...');
        addLog(`Executando listarArquivos para o período atual.`);

        // Attempt listing
        const { files } = await client.listarArquivos({ susep, login: token, senha: password });
        addLog(`[STEP 1] Resposta da API recebida. Encontrados ${files.length} arquivos.`);

        // Step 2: Identify Consortium File
        const consortiumFile = files.find(f => f.produto === 'CONSORCIO' || f.nomeArquivo?.includes('CONSORCIO'));

        if (!consortiumFile) {
          addLog('[STEP 2] Nenhum arquivo de disponibilidade de Consórcio encontrado. Encerrando tarefa.', 'WARN');
          setIsRunning(false);
          return;
        }

        addLog(`[STEP 2] Arquivo alvo identificado: ${consortiumFile.nomeArquivo} (ID: ${consortiumFile.codigo})`);

        // Step 3: Download File Content
        addLog('[STEP 3] Executando recuperarConteudoArquivo...');
        const { content } = await client.recuperarConteudo({ susep, login: token, senha: password }, consortiumFile.codigo);
        addLog(`[STEP 3] Download concluído. Tamanho (Base64): ${content.conteudoBase64?.length} bytes.`);

        // Step 4: Process Content (Decode and Parse)
        addLog('[STEP 4] Decodificando conteúdo Base64...');
        if (!content.conteudoDecodificado) {
            throw new Error("O conteúdo do arquivo baixado está vazio.");
        }
        addLog(`[STEP 4] Decodificado com sucesso. Iniciando Parser (TXT/CSV)...`);

        const lines = content.conteudoDecodificado.split('\n').filter(line => line.trim() !== '');
        const recordCount = lines.length > 0 ? lines.length - 1 : 0; 
        addLog(`[STEP 4] Análise concluída. ${recordCount} registros (Grupos/Cotas) extraídos.`);

        // Step 5: Database Sync
        addLog('[STEP 5] Sincronizando dados com o Banco de Dados (Firestore/Postgres)...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        addLog(`[STEP 5] Banco de dados atualizado com sucesso. ${recordCount} entradas processadas.`, 'SUCCESS');

        addLog('Pipeline concluído com sucesso.');

      } catch (error) {
        addLog('Falha na execução do Pipeline durante interação com a API.', 'ERROR');

        if (error instanceof SoapError) {
            addLog('--- DETALHES DA FALHA SOAP (SOAP FAULT) ---', 'ERROR');
            addLog(`Código da Falha (FaultCode): ${error.faultCode}`, 'ERROR');
            addLog(`Descrição (FaultString): ${error.faultString}`, 'ERROR');
            const detail = error.detail || 'N/A';
            addLog(`Detalhes Técnicos: ${detail.substring(0, 200)}${detail.length > 200 ? '...' : ''}`, 'ERROR');
            addLog('--------------------------------------------', 'ERROR');
        } else {
            const message = error instanceof Error ? error.message : String(error);
            addLog(`Erro Inesperado (Não-SOAP): ${message}`, 'ERROR');
        }
        addLog('Tarefa abortada devido ao erro.');
      } finally {
        setIsRunning(false);
      }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'ERROR': return 'text-red-500 font-bold';
            case 'WARN': return 'text-yellow-400';
            case 'SUCCESS': return 'text-green-400 font-semibold';
            default: return 'text-gray-300';
        }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Cloud Job Scheduler (Backend Worker)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Simulação da tarefa automatizada diária para extração e processamento de dados.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                <div className="flex items-center space-x-2">
                    <span className='text-sm font-bold text-gray-700 dark:text-gray-300'>Agendamento:</span>
                    <input value={schedule} readOnly className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm w-52" aria-label="Horário de Execução"/>
                </div>
                 <div className="flex items-center gap-2">
                    <strong className="text-sm text-gray-700 dark:text-gray-300">Status:</strong> 
                    {isRunning ? <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm animate-pulse">Em Execução...</span> : <span className="text-green-600 dark:text-green-400 font-semibold text-sm">Aguardando</span>}
                </div>
            </div>

            <div className='flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full lg:w-auto'>
                <label className="flex items-center space-x-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600">
                    <input 
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                    />
                    <span className={`text-sm font-medium ${simulateFailure ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>Simular Falha SOAP</span>
                </label>

                <button 
                    onClick={executeTask} 
                    disabled={isRunning} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-transform transform active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    {isRunning ? 'Executando...' : 'Executar Tarefa Agora'}
                </button>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto font-mono text-xs shadow-inner border border-gray-700">
            {logs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p>Terminal de Logs - Aguardando Execução</p>
                 </div>
            ) : (
                <>
                    {logs.map((log, index) => (
                      <div key={index} className="flex mb-1 hover:bg-white/5 p-0.5 rounded">
                        <span className="text-gray-500 mr-3 w-20 flex-shrink-0">[{log.timestamp}]</span>
                        <span className={`${getLogColor(log.type)} mr-3 w-16 flex-shrink-0`}>[{log.type}]</span>
                        <span className="text-gray-300 break-all">{log.message}</span>
                      </div>
                    ))}
                    {isRunning && <div className="flex mt-1"><span className="text-green-400 animate-pulse">_</span></div>}
                </>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </div>
    );
};


export const DeveloperHub = () => {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'debugger'>('scheduler');

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Developer Integration Hub</h1>
                <p className="text-gray-500 dark:text-gray-400">Ferramentas de diagnóstico e orquestração de APIs de parceiros (Porto Seguro/Mapfre).</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start md:self-auto">
                <button 
                    onClick={() => setActiveTab('scheduler')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'scheduler' ? 'bg-white dark:bg-gray-600 text-cyan-600 dark:text-cyan-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Cloud Scheduler
                </button>
                <button 
                    onClick={() => setActiveTab('debugger')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'debugger' ? 'bg-white dark:bg-gray-600 text-cyan-600 dark:text-cyan-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    SOAP Debugger
                </button>
            </div>
       </div>

      {activeTab === 'scheduler' ? <CloudJobScheduler /> : <IntegrationDebugger />}
    </div>
  );
};
