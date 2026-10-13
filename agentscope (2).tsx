import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Search, Lock, User, LogIn, Download, RefreshCcw, 
  Settings, Loader2, FileText, FileSpreadsheet, AlertCircle, CheckCircle2 
} from 'lucide-react';

/* 
 * CONSTANTS & DATA 
 * Defining the 10 niches based on the strategic document.
 */
const NICHES = [
  "Equipamentos e Acessórios Esportivos de Raquete",
  "Produtos Inteligentes e Premium para Pets (Pet Tech)",
  "Papelaria Fina para Estudantes de Alta Performance",
  "Setup e Ergonomia para Desenvolvedores e Home Office",
  "Moda Esportiva de Nicho (Athleisure e Práticas Específicas)",
  "Equipamentos para Criação de Conteúdo e Audiovisual",
  "Casa Inteligente (Smart Home) e Automação Residencial",
  "Acessórios de Organização para Viagens (Travel Tech)",
  "Moda Retrô e Casual para Torcedores (Fan Merch)",
  "Decoração Minimalista e Organização de Interiores"
];

const LOGO_URL = "https://i.postimg.cc/t45FWyBs/imagem-transparente.png";

// Dynamic script loader for PDF export capabilities
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export default function AgentScopeApp() {
  // App State
  const [view, setView] = useState('login'); // 'login', 'params', 'loading', 'results'
  const [authError, setAuthError] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Credentials State
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  
  // Parameters State
  const [params, setParams] = useState({
    niche: NICHES[0],
    ticketMin: '', ticketMax: '', marginMin: '3x', priceSensitivity: 'Média',
    gender: 'Unissex', ageMin: '', ageMax: '', awareness: 'Consciente do Problema', buyingBehavior: 'Racional',
    maxWeight: '', volume: 'Compacto', fragility: 'Baixo', supplyType: 'Internacional',
    seasonality: 'Perene', competition: 'Média',
    wowFactor: 'Sim', painType: 'Analgésico'
  });

  // Results State
  const [results, setResults] = useState([]);

  // Load external libraries for export on mount
  useEffect(() => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'))
      .catch(err => console.error("Error loading PDF libraries", err));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.email === 'admin@agentscope.com' && credentials.password === 'Scope2026!') {
      setAuthError(false);
      setView('params');
    } else {
      setAuthError(true);
    }
  };

  const runAgent = async () => {
    setView('loading');

    const promptText = `
      Atue como um Estrategista de E-commerce Sênior e Arquiteto de Conversão.
      Você deve pesquisar, estruturar o scoring e rankear estritamente os 10 melhores produtos para venda online com base nos parâmetros exatos abaixo.
      
      PARÂMETROS DA PESQUISA:
      - Nicho Selecionado: ${params.niche}
      - Ticket Médio Alvo: R$ ${params.ticketMin} a R$ ${params.ticketMax}
      - Margem de Lucro Mínima: ${params.marginMin}
      - Sensibilidade a Preço: ${params.priceSensitivity}
      - Público-Alvo: ${params.gender}, ${params.ageMin} a ${params.ageMax} anos
      - Nível de Consciência: ${params.awareness}
      - Comportamento de Compra: ${params.buyingBehavior}
      - Logística: Peso máximo de ${params.maxWeight}g, Volume ${params.volume}, Fragilidade ${params.fragility}, Origem ${params.supplyType}
      - Mercado: Sazonalidade ${params.seasonality}, Concorrência ${params.competition}
      - Marketing: Fator UAU Visual: ${params.wowFactor}, Dor Resolvida: ${params.painType}

      REGRAS DO ALGORITMO:
      1. Cruze esses dados e avalie viabilidade logística, persona, finanças e marketing.
      2. Selecione e RANQUEIE estritamente 10 produtos.
      3. O 1º produto deve ser o MAIS relevante, de maior conversão e viabilidade. O 10º deve ser o menos relevante do top 10.
      4. Forneça Prós, Contras e um link de referência (AliExpress, Amazon, etc) que sirva de exemplo real do produto.
    `;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          description: "Lista estrita contendo exatamente 10 produtos rankeados.",
          items: {
            type: "OBJECT",
            properties: {
              rank: { type: "INTEGER", description: "Posição de 1 a 10" },
              name: { type: "STRING", description: "Nome comercial do produto" },
              description: { type: "STRING", description: "Breve descrição do produto" },
              context: { type: "STRING", description: "Contexto justificando sua posição no ranking com base no scoring" },
              pros: { type: "ARRAY", items: { type: "STRING" }, description: "3 Vantagens competitivas/margem/apelo" },
              cons: { type: "ARRAY", items: { type: "STRING" }, description: "2 Barreiras logísticas ou objeções" },
              link: { type: "STRING", description: "URL de referência real (ex: Amazon, AliExpress, Shopee)" }
            },
            required: ["rank", "name", "description", "context", "pros", "cons", "link"]
          }
        }
      }
    };

    try {
      const apiKey = ""; // Provided automatically by Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        const jsonText = data.candidates[0].content.parts[0].text;
        const parsedResults = JSON.parse(jsonText);
        // Ensure ranking order and strict 10 item limit just in case
        const sorted = parsedResults.sort((a, b) => a.rank - b.rank).slice(0, 10);
        setResults(sorted);
        setView('results');
      } else {
        throw new Error("Resposta inválida da IA");
      }
    } catch (error) {
      console.error("Erro ao gerar resultados:", error);
      // Fallback/Error state could be handled here
      setView('params'); 
    }
  };

  const exportToExcel = () => {
    // Generate CSV for Excel
    const headers = ['Rank', 'Produto', 'Descricao', 'Contexto_Scoring', 'Pros', 'Contras', 'Link_Referencia'];
    const csvRows = [headers.join(',')];
    
    results.forEach(p => {
      const row = [
        p.rank,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.description.replace(/"/g, '""')}"`,
        `"${p.context.replace(/"/g, '""')}"`,
        `"${p.pros.join('; ').replace(/"/g, '""')}"`,
        `"${p.cons.join('; ').replace(/"/g, '""')}"`,
        `"${p.link}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AgentScope_Resultados.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      console.error("jsPDF not loaded yet.");
      return;
    }
    
    setExporting(true);
    const doc = new window.jspdf.jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text(`Relatório Agent Scope - ${params.niche}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Ticket: R$${params.ticketMin}-${params.ticketMax} | Margem: ${params.marginMin} | Persona: ${params.gender}, ${params.ageMin}-${params.ageMax} anos`, 14, 30);

    const tableBody = results.map(p => [
      p.rank,
      p.name,
      p.pros.join('\n'),
      p.cons.join('\n'),
      p.link
    ]);

    doc.autoTable({
      startY: 40,
      head: [['#', 'Produto', 'Diferenciais (Prós)', 'Contras', 'Link Referência']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Blue-500
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 65 },
        3: { cellWidth: 65 },
        4: { cellWidth: 45, overflow: 'linebreak' }
      },
      styles: { fontSize: 9 }
    });

    doc.save("AgentScope_Relatorio.pdf");
    setExporting(false);
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#dcecf9] flex flex-col items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
        {/* Efeito de ondas concêntricas de fundo (Mockup) */}
        <div className="absolute w-[900px] h-[900px] border-[50px] border-blue-200/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute w-[650px] h-[650px] border-[50px] border-blue-200/30 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] border-[40px] border-blue-200/40 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="mb-8 flex flex-col items-center z-10">
          <img src={LOGO_URL} alt="Agent Scope Logo" className="w-80 md:w-96 h-auto drop-shadow-sm mb-4" style={{ mixBlendMode: 'multiply' }} />
          <h2 className="text-xl font-semibold text-slate-800 mt-2">Agente para Nicho</h2>
          <p className="text-md text-slate-600 mt-6 mb-2 font-medium">Insira sua senha</p>
        </div>

        <div className="w-full max-w-xs z-10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                required
                placeholder="Login"
                className="w-full px-6 py-4 bg-white/95 border-none rounded-full shadow-sm focus:ring-2 focus:ring-purple-400 transition-colors outline-none text-center text-slate-700 font-medium placeholder:text-slate-400"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            
            <div>
              <input 
                type="password" 
                required
                placeholder="Senha"
                className="w-full px-6 py-4 bg-white/95 border-none rounded-full shadow-sm focus:ring-2 focus:ring-purple-400 transition-colors outline-none text-center text-slate-700 font-medium placeholder:text-slate-400"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>

            {authError && (
              <div className="flex items-center justify-center space-x-2 text-red-500 text-sm bg-red-50 p-3 rounded-full border border-red-100">
                <AlertCircle className="w-4 h-4" />
                <span>Credenciais inválidas.</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full flex items-center justify-center space-x-2 bg-[#dcecf9] hover:bg-blue-100 text-slate-700 border border-slate-300 py-3.5 rounded-full font-medium transition-all mt-4"
            >
              <span>Entrar</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-[#dcecf9] flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-[40px] shadow-xl flex flex-col items-center text-center max-w-sm w-full border border-white/50">
          <img src={LOGO_URL} alt="Agent Scope Logo" className="w-48 md:w-56 h-auto mb-6 animate-pulse" style={{ mixBlendMode: 'multiply' }} />
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Analisando o Mercado</h2>
          <p className="text-slate-600 text-sm">
            O Agent Scope está cruzando parâmetros logísticos, financeiros e comportamentais para identificar os 10 melhores produtos no nicho selecionado.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'params') {
    return (
      <div className="min-h-screen bg-[#dcecf9] pb-20 font-sans">
        {/* Header (Logo centralizada) */}
        <header className="pt-8 pb-4 px-6 flex justify-center items-center">
          <img src={LOGO_URL} alt="Agent Scope Logo" className="w-72 md:w-80 h-auto drop-shadow-sm" style={{ mixBlendMode: 'multiply' }} />
        </header>

        <main className="max-w-4xl mx-auto mt-4 px-4">
          <form onSubmit={(e) => { e.preventDefault(); runAgent(); }} className="space-y-6">
            
            {/* Niche Selection */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-slate-800 mb-4">Selecione o seu nicho:</h1>
              <select 
                className="w-full max-w-xl mx-auto block bg-white border-none rounded-full shadow-sm px-6 py-4 outline-none focus:ring-2 focus:ring-purple-400 transition-all text-slate-700 font-medium text-center appearance-none"
                value={params.niche}
                onChange={(e) => setParams({...params, niche: e.target.value})}
                required
              >
                {NICHES.map((niche, idx) => (
                  <option key={idx} value={niche}>{niche}</option>
                ))}
              </select>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-medium text-slate-800">Parâmetros para o agente</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financials */}
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-200/50 pb-2 mb-4">Finanças e Precificação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">De: (Ticket Mín)</label>
                    <input type="number" required placeholder="R$ 80" className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none" value={params.ticketMin} onChange={(e) => setParams({...params, ticketMin: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Até: (Ticket Máx)</label>
                    <input type="number" required placeholder="R$ 250" className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none" value={params.ticketMax} onChange={(e) => setParams({...params, ticketMax: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Margem Mínima</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.marginMin} onChange={(e) => setParams({...params, marginMin: e.target.value})}>
                      <option>1.5x</option><option>2x</option><option>3x</option><option>4x+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Sensibilidade a Preço</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.priceSensitivity} onChange={(e) => setParams({...params, priceSensitivity: e.target.value})}>
                      <option>Baixa</option><option>Média</option><option>Alta</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Persona */}
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-200/50 pb-2 mb-4">Perfil do Consumidor</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Gênero</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-2 py-2 text-sm outline-none" value={params.gender} onChange={(e) => setParams({...params, gender: e.target.value})}>
                      <option>Masculino</option><option>Feminino</option><option>Unissex</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">De: (Idade)</label>
                    <input type="number" required placeholder="18" className="w-full bg-white border-none rounded-xl shadow-sm px-2 py-2 text-sm outline-none" value={params.ageMin} onChange={(e) => setParams({...params, ageMin: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Até: (Idade)</label>
                    <input type="number" required placeholder="40" className="w-full bg-white border-none rounded-xl shadow-sm px-2 py-2 text-sm outline-none" value={params.ageMax} onChange={(e) => setParams({...params, ageMax: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nível de Consciência</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-2 py-2 text-sm outline-none" value={params.awareness} onChange={(e) => setParams({...params, awareness: e.target.value})}>
                      <option>Inconsciente</option><option>Consciente do Problema</option><option>Consciente da Solução</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Comportamento</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-2 py-2 text-sm outline-none" value={params.buyingBehavior} onChange={(e) => setParams({...params, buyingBehavior: e.target.value})}>
                      <option>Impulsivo</option><option>Racional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-200/50 pb-2 mb-4">Logística e Operação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Peso do Produto (g)</label>
                    <input type="number" required placeholder="Ex: 500" className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 outline-none" value={params.maxWeight} onChange={(e) => setParams({...params, maxWeight: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Origem do Fornecedor</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.supplyType} onChange={(e) => setParams({...params, supplyType: e.target.value})}>
                      <option>Internacional</option><option>Nacional</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Fragilidade</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.fragility} onChange={(e) => setParams({...params, fragility: e.target.value})}>
                      <option>Baixo</option><option>Médio</option><option>Alto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Volume/Cubagem</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.volume} onChange={(e) => setParams({...params, volume: e.target.value})}>
                      <option>Compacto</option><option>Volumoso</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Market & Marketing */}
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b border-slate-200/50 pb-2 mb-4">Mercado e Conversão</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Sazonalidade</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.seasonality} onChange={(e) => setParams({...params, seasonality: e.target.value})}>
                      <option>Perene</option><option>Sazonal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Nível de Concorrência</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.competition} onChange={(e) => setParams({...params, competition: e.target.value})}>
                      <option>Baixa</option><option>Média</option><option>Alta</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Fator "UAU" Visual</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.wowFactor} onChange={(e) => setParams({...params, wowFactor: e.target.value})}>
                      <option>Sim</option><option>Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Dor Principal</label>
                    <select className="w-full bg-white border-none rounded-xl shadow-sm px-3 py-2 text-sm outline-none" value={params.painType} onChange={(e) => setParams({...params, painType: e.target.value})}>
                      <option>Analgésico</option><option>Vitamina</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-10 flex justify-center">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-[#d946ef] to-[#a855f7] hover:from-[#c026d3] hover:to-[#9333ea] text-white font-semibold py-4 px-20 rounded-full shadow-lg shadow-purple-500/20 transition-all text-lg"
              >
                Resultado
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  if (view === 'results') {
    return (
      <div className="min-h-screen bg-[#dcecf9] flex flex-col">
        {/* Header Compacto com Logo */}
        <header className="py-6 px-6 flex flex-col items-center justify-center relative">
          <img src={LOGO_URL} alt="Agent Scope Logo" className="w-64 md:w-72 h-auto drop-shadow-sm mb-2" style={{ mixBlendMode: 'multiply' }} />
          <h1 className="text-2xl font-semibold text-slate-800">Resultados</h1>
          <div className="absolute right-6 top-6 hidden md:block text-xs font-medium text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-white">
            {params.niche.substring(0, 30)}...
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
          
          {/* 3 Columns Layout Area */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden mb-8">
            
            {/* Col 1: Produtos */}
            <div className="bg-white rounded-[40px] shadow-sm flex flex-col overflow-hidden border border-white/50">
              <div className="pt-6 pb-2 text-center">
                <h2 className="text-xl font-medium text-slate-700">Produtos:</h2>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-4 styled-scrollbar">
                {results.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 relative">
                    <div className="absolute -left-2 -top-2 w-8 h-8 bg-gradient-to-r from-[#d946ef] to-[#a855f7] text-white font-bold rounded-full flex items-center justify-center shadow-sm">
                      {item.rank}
                    </div>
                    <h3 className="font-semibold text-slate-800 ml-4 mb-2">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                    <div className="bg-white p-3 rounded-2xl text-xs text-slate-500 border border-slate-100 italic">
                      <strong className="text-slate-700 not-italic">Scoring:</strong> {item.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Diferenciais */}
            <div className="bg-white rounded-[40px] shadow-sm flex flex-col overflow-hidden border border-white/50">
              <div className="pt-6 pb-2 text-center">
                <h2 className="text-xl font-medium text-slate-700">Diferencias:</h2>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-6 styled-scrollbar">
                {results.map((item, idx) => (
                  <div key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="text-sm font-semibold text-slate-400 mb-3">Ref #{item.rank}: {item.name.substring(0,25)}...</div>
                    <div className="mb-4">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 block">Prós / Vantagens</span>
                      <ul className="text-sm text-slate-700 space-y-1.5 pl-4 list-disc marker:text-emerald-400">
                        {item.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 block">Contras / Barreiras</span>
                      <ul className="text-sm text-slate-700 space-y-1.5 pl-4 list-disc marker:text-rose-400">
                        {item.cons.map((con, i) => <li key={i}>{con}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Links */}
            <div className="bg-white rounded-[40px] shadow-sm flex flex-col overflow-hidden border border-white/50">
              <div className="pt-6 pb-2 text-center">
                <h2 className="text-xl font-medium text-slate-700">Links:</h2>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-4 styled-scrollbar">
                {results.map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between h-32">
                    <div>
                      <div className="text-xs font-bold text-slate-400 mb-1">Rank {item.rank}</div>
                      <div className="text-sm font-medium text-slate-700 line-clamp-2">{item.name}</div>
                    </div>
                    <a 
                      href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 text-sm text-center font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 py-2 rounded-xl transition-colors border border-purple-100"
                    >
                      Acessar Referência
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="px-4 flex flex-col md:flex-row justify-between items-center gap-4 flex-none">
            <button 
              onClick={() => setView('params')}
              className="bg-gradient-to-r from-[#d946ef] to-[#a855f7] hover:from-[#c026d3] hover:to-[#9333ea] text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-md w-full md:w-auto"
            >
              Realizar nova pesquisa
            </button>

            <div className="flex space-x-3 w-full md:w-auto">
              <button 
                onClick={exportToExcel}
                className="flex-1 md:flex-none bg-gradient-to-r from-[#d946ef] to-[#a855f7] hover:from-[#c026d3] hover:to-[#9333ea] text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-md text-center"
              >
                Exportar Excel
              </button>
              <button 
                onClick={exportToPDF}
                disabled={exporting}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-[#d946ef] to-[#a855f7] hover:from-[#c026d3] hover:to-[#9333ea] text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-md disabled:opacity-70"
              >
                {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>
        </main>
        
        {/* Custom scrollbar styles injected in the component */}
        <style dangerouslySetInnerHTML={{__html: `
          .styled-scrollbar::-webkit-scrollbar { width: 6px; }
          .styled-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .styled-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}} />
      </div>
    );
  }

  return null;
}