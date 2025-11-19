
import type { ConsorcioPlan } from '../types';

const WSDL_NAMESPACE = "http://ws.centraldownloadsics.pecorporativo.corporativo.porto.com/";
const SOAP_ENV_NAMESPACE = "http://schemas.xmlsoap.org/soap/envelope/";

export const PORTO_PRODUCTION_ENDPOINT = "https://wwws.portoseguro.com.br/CentralDownloadsIntegrationService/Proxy_Services/ArquivoRetornoIntegrationService";

export const SOAP_ACTION_HEADER = {
    "Content-Type": "text/xml; charset=utf-8",
    "SOAPAction": ""
};

export interface PortoCredentials {
  susep: string;
  senha: string;
  login: string;
}

export interface PortoFile {
  codigo: number;
  dataDownload: string;
  dataGeracao: string;
  nomeArquivo: string;
  produto: string;
  susep: string;
  tipoArquivo: string;
}

export interface PortoFileContent {
    nome: string;
    conteudoBase64: string;
    conteudoDecodificado: string;
}

export interface ConsorcioGroupData {
    grupo: string;
    cotasVagas: number;
    prazo: number;
    credito: number;
    taxa: number;
}

/**
 * Custom Error class for SOAP Faults
 */
export class SoapError extends Error {
  public faultCode: string;
  public faultString: string;
  public detail: string | undefined;

  constructor(faultCode: string, faultString: string, detail?: string) {
    super(faultString);
    this.name = 'SoapError';
    this.faultCode = faultCode;
    this.faultString = faultString;
    this.detail = detail;
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, SoapError.prototype);
  }
}

/**
 * Formats a Date object to the specific format required by SOAP (YYYY-MM-DDTHH:mm:ss)
 * or just YYYY-MM-DD if the service is lenient, but docs say 'datetime'.
 */
const formatDate = (date: Date): string => {
    return date.toISOString().split('.')[0];
};

/**
 * Builds the SOAP Envelope for the 'listarArquivos' operation.
 * Reference: Manual Técnico - 2.1. listarArquivos
 */
export const buildListarArquivosEnvelope = (
  creds: PortoCredentials,
  inicioPeriodo: Date,
  finalPeriodo: Date
): string => {
  return `
<soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NAMESPACE}" xmlns:ws="${WSDL_NAMESPACE}">
   <soapenv:Header>
      <ws:susep>${creds.susep}</ws:susep>
      <ws:senha>${creds.senha}</ws:senha>
      <ws:login>${creds.login}</ws:login>
   </soapenv:Header>
   <soapenv:Body>
      <ws:listarArquivos>
         <inicioPeriodo>${formatDate(inicioPeriodo)}</inicioPeriodo>
         <finalPeriodo>${formatDate(finalPeriodo)}</finalPeriodo>
      </ws:listarArquivos>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
};

/**
 * Builds the SOAP Envelope for the 'recuperarConteudoArquivo' operation.
 * Reference: Manual Técnico - 2.2. recuperarConteudoArquivo
 */
export const buildRecuperarConteudoEnvelope = (
  creds: PortoCredentials,
  idArquivo: number
): string => {
  return `
<soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NAMESPACE}" xmlns:ws="${WSDL_NAMESPACE}">
   <soapenv:Header>
      <ws:susep>${creds.susep}</ws:susep>
      <ws:senha>${creds.senha}</ws:senha>
      <ws:login>${creds.login}</ws:login>
   </soapenv:Header>
   <soapenv:Body>
      <ws:recuperarConteudoArquivo>
         <idArquivo>${idArquivo}</idArquivo>
      </ws:recuperarConteudoArquivo>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
};

/**
 * Parses the XML to check for SOAP Faults.
 * Returns a SoapError if a fault is found, otherwise null.
 */
export const parseSoapFault = (xmlString: string): SoapError | null => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const fault = xmlDoc.getElementsByTagName("Fault")[0] || 
                      xmlDoc.getElementsByTagName("soapenv:Fault")[0] ||
                      xmlDoc.getElementsByTagName("soap:Fault")[0];
        
        if (fault) {
            const faultCode = fault.getElementsByTagName("faultcode")[0]?.textContent || "Unknown";
            const faultString = fault.getElementsByTagName("faultstring")[0]?.textContent || "Unknown Error";
            const detail = fault.getElementsByTagName("detail")[0]?.textContent || undefined;
            return new SoapError(faultCode, faultString, detail);
        }
    } catch (e) {
        return null;
    }
    return null;
};

/**
 * Parses the XML response from 'listarArquivos'.
 */
export const parseListarArquivosResponse = (xmlString: string): PortoFile[] => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const arquivosNodes = xmlDoc.getElementsByTagName("dadosArquivoWS");
        
        const files: PortoFile[] = [];
        
        // Manual parsing of the XML structure based on the provided OCR/XSD
        for (let i = 0; i < arquivosNodes.length; i++) {
            const node = arquivosNodes[i];
            const getVal = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent || "";
            
            files.push({
                codigo: parseInt(getVal("codigo") || "0"),
                dataDownload: getVal("dataDownload"),
                dataGeracao: getVal("dataGeracao"),
                nomeArquivo: getVal("nomeArquivo"),
                produto: getVal("produto"), 
                susep: getVal("susep"),
                tipoArquivo: getVal("tipoArquivo")
            });
        }
        return files;
    } catch (e) {
        console.error("Error parsing SOAP response", e);
        return [];
    }
};

/**
 * Parses the XML response from 'recuperarConteudoArquivo'.
 * Extract the Base64 content and the filename.
 */
export const parseRecuperarConteudoResponse = (xmlString: string): PortoFileContent | null => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        
        // Find <conteudoArquivo> inside the response
        const conteudoNode = xmlDoc.getElementsByTagName("conteudoArquivo")[0];
        
        if (!conteudoNode) return null;

        const nome = conteudoNode.getElementsByTagName("nome")[0]?.textContent || "desconhecido.txt";
        const conteudoBase64 = conteudoNode.getElementsByTagName("conteudo")[0]?.textContent || "";
        
        // Browser-side decoding for demonstration
        let conteudoDecodificado = "";
        try {
            conteudoDecodificado = atob(conteudoBase64);
        } catch (e) {
            conteudoDecodificado = "Erro ao decodificar Base64.";
        }

        return {
            nome,
            conteudoBase64,
            conteudoDecodificado
        };

    } catch (e) {
        console.error("Error parsing SOAP download response", e);
        return null;
    }
};

/**
 * Parses a raw TXT/CSV string from Porto into structured objects.
 * Assuming format: GRUPO;COTAS_VAGAS;PRAZO;CREDITO;TAXA
 */
export const parseConsorcioGroupFile = (content: string): ConsorcioGroupData[] => {
    const lines = content.split('\n');
    const data: ConsorcioGroupData[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('GRUPO')) continue; // Skip header or empty lines
        
        const parts = line.split(';');
        if (parts.length >= 5) {
            data.push({
                grupo: parts[0],
                cotasVagas: parseInt(parts[1]),
                prazo: parseInt(parts[2]),
                credito: parseFloat(parts[3]),
                taxa: parseFloat(parts[4])
            });
        }
    }
    return data;
};

// --- MOCK DATA FOR DEMONSTRATION ---

export const MOCK_SOAP_FAULT = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
      <soapenv:Fault>
         <faultcode>soapenv:Client.Authentication</faultcode>
         <faultstring>Credenciais inválidas ou expiradas na autenticação.</faultstring>
         <detail>
            <ns2:PortoFault xmlns:ns2="http://ws.porto.com/faults">
               <errorCode>AUTH-401</errorCode>
               <errorMessage>O SUSEP informado não possui permissão de acesso a este recurso.</errorMessage>
            </ns2:PortoFault>
         </detail>
      </soapenv:Fault>
   </soapenv:Body>
</soapenv:Envelope>
`.trim();

export const MOCK_LISTAR_ARQUIVOS_RESPONSE = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
<soapenv:Body>
<dlwmin:listarArquivosResponse xmlns:dlwmin="${WSDL_NAMESPACE}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<ns2:retornoArquivosDiarios xmlns:ns2="${WSDL_NAMESPACE}">
<arquivos>
<dadosArquivoWS>
<codigo>39246768</codigo>
<dataDownload>2025-11-18T08:00:00</dataDownload>
<dataGeracao>2025-11-18T02:00:00</dataGeracao>
<nomeArquivo>99994J000157.SI2</nomeArquivo>
<produto>CONSORCIO</produto>
<susep>99994J</susep>
<tipoArquivo>DIARIO</tipoArquivo>
</dadosArquivoWS>
<dadosArquivoWS>
<codigo>39246769</codigo>
<dataDownload>2025-11-18T08:00:00</dataDownload>
<dataGeracao>2025-11-18T02:00:00</dataGeracao>
<nomeArquivo>TABELA_GRUPOS_VAGO.TXT</nomeArquivo>
<produto>CONSORCIO</produto>
<susep>99994J</susep>
<tipoArquivo>EVENTUAL</tipoArquivo>
</dadosArquivoWS>
</arquivos>
</ns2:retornoArquivosDiarios>
</dlwmin:listarArquivosResponse>
</soapenv:Body>
</soapenv:Envelope>
`;

// Mock payload: A simple text file encoded in Base64 simulating a group list
const MOCK_FILE_CONTENT = `
GRUPO;COTAS_VAGAS;PRAZO;CREDITO;TAXA
1020;15;200;300000;19.5
1022;08;180;500000;18.0
1045;22;150;250000;20.0
`.trim();
const MOCK_BASE64 = btoa(MOCK_FILE_CONTENT);

export const MOCK_RECUPERAR_CONTEUDO_RESPONSE = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
<soapenv:Body>
<ns2:recuperarConteudoArquivoResponse xmlns:ns2="${WSDL_NAMESPACE}">
<ns2:retornoRecuperarConteudoArquivo>
<conteudoArquivo>
<conteudo>${MOCK_BASE64}</conteudo>
<nome>TABELA_GRUPOS_VAGO.TXT</nome>
</conteudoArquivo>
</ns2:retornoRecuperarConteudoArquivo>
</ns2:recuperarConteudoArquivoResponse>
</soapenv:Body>
</soapenv:Envelope>
`;

/**
 * A reusable SOAP Client class for interacting with the Porto Seguro API.
 * Handles request building, network transmission (mock or real), and response parsing.
 */
export class PortoClient {
    private endpoint: string;
    private useMock: boolean;

    constructor(endpoint: string = PORTO_PRODUCTION_ENDPOINT, useMock: boolean = true) {
        this.endpoint = endpoint;
        this.useMock = useMock;
    }

    /**
     * Lists available files from Porto Seguro for a given period.
     */
    async listarArquivos(
        creds: PortoCredentials, 
        inicio: Date = new Date(), 
        fim: Date = new Date()
    ): Promise<{ xmlRequest: string, files: PortoFile[] }> {
        
        const xml = buildListarArquivosEnvelope(creds, inicio, fim);
        
        if (this.useMock) {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 1500));
            
            // SIMULATE SOAP FAULT if credentials are flagged
            if (creds.susep === 'ERROR') {
                const fault = parseSoapFault(MOCK_SOAP_FAULT);
                if (fault) throw fault;
            }

            const files = parseListarArquivosResponse(MOCK_LISTAR_ARQUIVOS_RESPONSE);
            return { xmlRequest: xml, files };
        } else {
            // Real implementation (Conceptual)
            // const response = await fetch(this.endpoint, { 
            //    method: 'POST', 
            //    body: xml, 
            //    headers: SOAP_ACTION_HEADER 
            // });
            // const text = await response.text();
            // const fault = parseSoapFault(text);
            // if (fault) throw fault;
            // return { xmlRequest: xml, files: parseListarArquivosResponse(text) };
            throw new Error("Live network calls not supported in demo.");
        }
    }
    
    /**
     * Downloads and decodes a specific file by ID.
     */
    async recuperarConteudo(
        creds: PortoCredentials, 
        id: number
    ): Promise<{ xmlRequest: string, content: PortoFileContent | null, parsedData: ConsorcioGroupData[] }> {
         
         const xml = buildRecuperarConteudoEnvelope(creds, id);
         
         if (this.useMock) {
             await new Promise(r => setTimeout(r, 1200));
             
            // SIMULATE SOAP FAULT if credentials are flagged
            if (creds.susep === 'ERROR') {
                const fault = parseSoapFault(MOCK_SOAP_FAULT);
                if (fault) throw fault;
            }

             const content = parseRecuperarConteudoResponse(MOCK_RECUPERAR_CONTEUDO_RESPONSE);
             const parsedData = content?.conteudoDecodificado ? parseConsorcioGroupFile(content.conteudoDecodificado) : [];
             return { xmlRequest: xml, content, parsedData };
         } else {
             throw new Error("Live network calls not supported in demo.");
         }
    }
}
