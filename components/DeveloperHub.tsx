import React, { useState, useRef, useEffect } from 'react';
import { runEtlPipeline, processUploadedFile, resetDatabase } from '../services/consorcioService';
import type { EtlLog } from '../types';

export const DeveloperHub = () => {
    const [logs, setLogs] = useState<EtlLog[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const consoleRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [logs]);

    const handleRunPipeline = async () => {
        setIsRunning(true);
        setLogs([]);
        
        await runEtlPipeline((log) => {
            setLogs(prev => [...prev, log]);
        });
        
        setIsRunning(false);
    };

    const handleResetDatabase = () => {
        resetDatabase();
        setLogs(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            level: 'WARN',
            message: 'Database local (localStorage) foi limpa. Execute o Sync novamente para restaurar dados.',
            source: 'Database'
        }]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsRunning(true);
        setLogs(prev => [...prev, { 
            id: Date.now().toString(), 
            timestamp: new Date().toLocaleTimeString(), 
            level: 'INFO', 
            message: `Iniciando ingestão de arquivo: ${file.name}`, 
            source: 'Drive' 
        }]);

        try {
            await processUploadedFile(file, (log) => setLogs(prev => [...prev, log]));
        } catch (error) {
            console.error(error);
        } finally {
            setIsRunning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getLogColor = (level: EtlLog['level'], message: string) => {
        if (message.includes('CACHE HIT')) return 'text-cyan-400 font-bold';
        if (message.includes('ignorado')) return 'text-yellow-500';
        if (message.includes('CRÍTICO')) return 'text-red-500 font-black';

        switch (level) {
            case 'ERROR': return 'text-red-500 font-bold';
            case 'WARN': return 'text-yellow-400';
            case 'SUCCESS': return 'text-green-400 font-semibold';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                        Unified Data Pipeline (Python Integration)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Importe o arquivo <code>consorcio_db.json</code> gerado pelo script Python.</p>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                    />
                    
                    <button 
                        onClick={handleResetDatabase}
                        disabled={isRunning}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded border border-red-200 transition-all flex items-center gap-2 text-sm"
                        title="Limpar localStorage"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Reset DB
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRunning}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-all flex items-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload JSON / CSV
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
                            Fluxo de Integração
                        </h4>
                        
                        <div className="space-y-4 text-xs">
                            <div className="flex items-start gap-2">
                                <div className="min-w-[20px] h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-full text-[10px] font-bold">1</div>
                                <p className="text-gray-600 dark:text-gray-400">Execute <code>analise_inteligente.py</code> localmente para processar PDFs/Excel.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="min-w-[20px] h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-full text-[10px] font-bold">2</div>
                                <p className="text-gray-600 dark:text-gray-400">Gere o arquivo <code>consorcio_db.json</code>.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="min-w-[20px] h-5 flex items-center justify-center bg-cyan-500 text-white rounded-full text-[10px] font-bold">3</div>
                                <p className="text-gray-600 dark:text-gray-400">Faça o Upload aqui para atualizar o App Web.</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-[10px] text-blue-700 dark:text-blue-300">
                            <strong>Schema Suportado:</strong> <code>{`{ id, type, company, group, credit, installment... }`}</code>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-gray-900 p-4 rounded-lg h-96 overflow-hidden flex flex-col shadow-inner border border-gray-700 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
                         <span className="text-gray-400">Console de Sincronização</span>
                         <div className="flex gap-1.5">
                             <span className="w-3 h-3 rounded-full bg-red-500"></span>
                             <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                             <span className="w-3 h-3 rounded-full bg-green-500"></span>
                         </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar" ref={consoleRef}>
                        {logs.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <p>Aguardando arquivo JSON/CSV...</p>
                             </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-2 hover:bg-white/5 p-0.5 rounded transition-colors">
                                    <span className="text-gray-500 flex-shrink-0 w-16">[{log.timestamp.split(' ')[0]}]</span>
                                    <span className={`font-bold flex-shrink-0 w-16 ${getLogColor(log.level, log.message)}`}>{log.level}</span>
                                    <span className="text-purple-400 flex-shrink-0 w-16">[{log.source}]</span>
                                    <span className={`flex-grow break-all ${getLogColor(log.level, log.message)}`}>{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};