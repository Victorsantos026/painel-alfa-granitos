import React, { useState, useEffect } from 'react';

const MATERIAIS_PADRAO = [
  'Granito Preto São Gabriel',
  'Granito Verde Ubatuba',
  'Granito Cinza Ocre',
  'Granito Branco Marfim',
  'Mármore Travertino',
  'Mármore Branco Carrara',
  'Quartzo Branco Absolute',
  'Outro (digitar personalizado)'
];

export default function App() {
  const [cliente, setCliente] = useState('');
  const [dataOrcamento, setDataOrcamento] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [itens, setItens] = useState([
    {
      descricao: 'Pia de cozinha com área seca / Bancada para cooktop',
      material: 'Granito Preto São Gabriel',
      materialOutro: '',
      comprimento: '3.35',
      largura: '0.60',
      valor: '2110.00'
    }
  ]);
  const [descontoAVista, setDescontoAVista] = useState(5);
  const [incluirInstalacao, setIncluirInstalacao] = useState(true);
  const [valorInstalacao, setValorInstalacao] = useState('800.00');
  const [orcamentosSalvos, setOrcamentosSalvos] = useState([]);

  useEffect(() => {
    const salvos = localStorage.getItem('alfa_granitos_orcamentos');
    if (salvos) {
      try {
        setOrcamentosSalvos(JSON.parse(salvos));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const adicionarItem = () => {
    setItens([
      ...itens,
      {
        descricao: '',
        material: 'Granito Preto São Gabriel',
        materialOutro: '',
        comprimento: '',
        largura: '',
        valor: ''
      }
    ]);
  };

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = valor;
    setItens(novosItens);
  };

  const subtotalItens = itens.reduce(
    (acc, item) => acc + (parseFloat(item.valor) || 0),
    0
  );
  const valorDesconto = (subtotalItens * descontoAVista) / 100;
  const valorAVista = subtotalItens - valorDesconto;
  const valorInstalacaoNum = incluirInstalacao
    ? parseFloat(valorInstalacao) || 0
    : 0;
  const totalComInstalacao = subtotalItens + valorInstalacaoNum;

  const formatarMoeda = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const salvarOrcamento = () => {
    if (!cliente.trim()) {
      alert('Por favor, informe o nome do cliente antes de salvar.');
      return;
    }

    const novoOrcamento = {
      id: Date.now(),
      cliente,
      dataOrcamento,
      itens,
      descontoAVista,
      incluirInstalacao,
      valorInstalacao,
      subtotalItens,
      totalComInstalacao
    };

    const atualizados = [novoOrcamento, ...orcamentosSalvos];
    setOrcamentosSalvos(atualizados);
    localStorage.setItem(
      'alfa_granitos_orcamentos',
      JSON.stringify(atualizados)
    );
    alert('Orçamento salvo com sucesso!');
  };

  const carregarOrcamento = (orc) => {
    setCliente(orc.cliente);
    setDataOrcamento(orc.dataOrcamento);
    setItens(orc.itens);
    setDescontoAVista(orc.descontoAVista);
    setIncluirInstalacao(orc.incluirInstalacao);
    setValorInstalacao(orc.valorInstalacao);
  };

  const excluirOrcamento = (id) => {
    const filtrados = orcamentosSalvos.filter((o) => o.id !== id);
    setOrcamentosSalvos(filtrados);
    localStorage.setItem(
      'alfa_granitos_orcamentos',
      JSON.stringify(filtrados)
    );
  };

  const gerarPDF = () => {
    if (!cliente.trim()) {
      alert('Digite o nome do cliente antes de gerar o PDF.');
      return;
    }
    document.title = `Orçamento - ${cliente}`;
    window.print();
  };

  const enviarWhatsApp = () => {
    if (!cliente.trim()) {
      alert('Digite o nome do cliente.');
      return;
    }

    let texto = `*ALFA GRANITOS - PROPOSTA COMERCIAL*\n\n`;
    texto += `*Cliente:* ${cliente}\n`;
    texto += `*Data:* ${new Date(dataOrcamento + 'T00:00:00').toLocaleDateString(
      'pt-BR'
    )}\n\n`;
    texto += `*ITENS DO ORÇAMENTO:*\n`;

    itens.forEach((it, idx) => {
      const mat =
        it.material === 'Outro (digitar personalizado)'
          ? it.materialOutro
          : it.material;
      texto += `${idx + 1}. *${it.descricao}*\n  Material: ${mat}\n  Medidas: ${it.comprimento} x ${it.largura} m\n  Valor: ${formatarMoeda(it.valor)}\n\n`;
    });

    texto += `*TOTAL DOS ITENS:* ${formatarMoeda(subtotalItens)}\n`;
    texto += `💳 *Parcelado:* Até 5x de ${formatarMoeda(
      subtotalItens / 5
    )} sem juros no cartão\n`;
    texto += `💵 *À vista (${descontoAVista}% desc.):* ${formatarMoeda(
      valorAVista
    )}\n\n`;

    if (incluirInstalacao) {
      texto += `🛠️ *SERVIÇO DE INSTALAÇÃO:* ${formatarMoeda(
        valorInstalacaoNum
      )}\n`;
      texto += `_Incluso: mão de obra, cantoneiras, silicone, massa plástica, argamassa e cimento._\n`;
      texto += `👉 *TOTAL COM INSTALAÇÃO:* ${formatarMoeda(
        totalComInstalacao
      )}\n\n`;
    }

    texto += `*Validade da proposta:* 7 dias.\nFicamos à disposição!`;

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-200 p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .pdf-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho de Ações */}
        <header className="no-print bg-zinc-900 border border-[#d4af37]/30 p-4 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-[#d4af37]">
              ALFA GRANITOS
            </h1>
            <p className="text-xs text-zinc-400">
              Gerador de Orçamentos & Dashboard
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={salvarOrcamento}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-[#d4af37]/50 text-[#d4af37] text-xs font-semibold rounded-lg transition"
            >
              💾 Salvar Dashboard
            </button>
            <button
              onClick={gerarPDF}
              className="px-4 py-2 bg-[#d4af37] hover:bg-[#b5932a] text-zinc-950 text-xs font-bold rounded-lg transition"
            >
              📄 Gerar PDF
            </button>
            <button
              onClick={enviarWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              💬 WhatsApp
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Painel Lateral - Configurações */}
          <div className="no-print space-y-6 lg:col-span-1">
            <div className="bg-zinc-900/90 p-5 rounded-xl border border-zinc-800 text-left">
              <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                1. Informações do Cliente
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Ex: Lucas Firmino"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Data do Orçamento
                  </label>
                  <input
                    type="date"
                    value={dataOrcamento}
                    onChange={(e) => setDataOrcamento(e.target.value)}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/90 p-5 rounded-xl border border-zinc-800 text-left">
              <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                2. Condições de Pagamento
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">
                    Desconto para Pagamento à Vista:
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="desconto"
                        checked={descontoAVista === 5}
                        onChange={() => setDescontoAVista(5)}
                        className="accent-[#d4af37]"
                      />
                      5%
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="desconto"
                        checked={descontoAVista === 10}
                        onChange={() => setDescontoAVista(10)}
                        className="accent-[#d4af37]"
                      />
                      10%
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incluirInstalacao}
                      onChange={(e) => setIncluirInstalacao(e.target.checked)}
                      className="accent-[#d4af37]"
                    />
                    <span className="text-xs font-semibold text-zinc-200">
                      Incluir Serviço de Instalação
                    </span>
                  </label>

                  {incluirInstalacao && (
                    <div className="mt-3">
                      <label className="block text-xs text-zinc-400 mb-1">
                        Valor da Instalação (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={valorInstalacao}
                        onChange={(e) => setValorInstalacao(e.target.value)}
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/90 p-5 rounded-xl border border-zinc-800 text-left">
              <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-3 border-b border-zinc-800 pb-2">
                📂 Orçamentos Salvos
              </h2>
              {orcamentosSalvos.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">
                  Nenhum orçamento salvo.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orcamentosSalvos.map((orc) => (
                    <div
                      key={orc.id}
                      className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-200">
                          {orc.cliente}
                        </p>
                        <p className="text-zinc-500">
                          {formatarMoeda(orc.subtotalItens)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => carregarOrcamento(orc)}
                          className="px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded hover:bg-[#d4af37]/20"
                        >
                          Abrir
                        </button>
                        <button
                          onClick={() => excluirOrcamento(orc.id)}
                          className="px-2 py-1 bg-red-950 text-red-400 border border-red-800 rounded hover:bg-red-900"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área Principal de Itens e Visualização do PDF */}
          <div className="lg:col-span-2 space-y-6 text-left">
            <div className="no-print bg-zinc-900/90 p-5 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                  3. Itens do Orçamento
                </h2>
                <button
                  onClick={adicionarItem}
                  className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#b5932a] text-zinc-950 text-xs font-bold rounded-lg transition"
                >
                  + Adicionar Item
                </button>
              </div>

              <div className="space-y-4">
                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#d4af37]">
                        Item #{String(index + 1).padStart(2, '0')}
                      </span>
                      {itens.length > 1 && (
                        <button
                          onClick={() => removerItem(index)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Descrição do Item
                      </label>
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) =>
                          atualizarItem(index, 'descricao', e.target.value)
                        }
                        placeholder="Ex: Pia de cozinha com área seca"
                        className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Material / Granito
                        </label>
                        <select
                          value={item.material}
                          onChange={(e) =>
                            atualizarItem(index, 'material', e.target.value)
                          }
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                        >
                          {MATERIAIS_PADRAO.map((mat) => (
                            <option key={mat} value={mat}>
                              {mat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {item.material === 'Outro (digitar personalizado)' && (
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">
                            Especifique o Material
                          </label>
                          <input
                            type="text"
                            value={item.materialOutro}
                            onChange={(e) =>
                              atualizarItem(
                                index,
                                'materialOutro',
                                e.target.value
                              )
                            }
                            placeholder="Nome do material"
                            className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Compr. (m)
                        </label>
                        <input
                          type="text"
                          value={item.comprimento}
                          onChange={(e) =>
                            atualizarItem(index, 'comprimento', e.target.value)
                          }
                          placeholder="3.35"
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Largura (m)
                        </label>
                        <input
                          type="text"
                          value={item.largura}
                          onChange={(e) =>
                            atualizarItem(index, 'largura', e.target.value)
                          }
                          placeholder="0.60"
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Valor (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.valor}
                          onChange={(e) =>
                            atualizarItem(index, 'valor', e.target.value)
                          }
                          placeholder="2110.00"
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 font-bold focus:border-[#d4af37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visualização de Impressão / PDF */}
            <div className="pdf-container bg-zinc-900 p-6 sm:p-10 rounded-xl border border-zinc-800 shadow-2xl space-y-6">
              <div className="flex justify-between items-start border-b-2 border-[#d4af37] pb-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-[#d4af37]">
                    ALFA GRANITOS
                  </h1>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-0.5">
                    Mármores • Granitos • Bancadas
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-[#d4af37] text-zinc-950 font-bold text-xs px-3 py-1 rounded">
                    ORÇAMENTO
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-sm">
                <div>
                  <span className="block text-xs font-bold text-zinc-500 uppercase">
                    Cliente
                  </span>
                  <span className="font-bold text-zinc-100 text-base">
                    {cliente || 'Nome do Cliente'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-zinc-500 uppercase">
                    Data
                  </span>
                  <span className="font-semibold text-zinc-300">
                    {new Date(dataOrcamento + 'T00:00:00').toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-3">
                  Itens do Orçamento
                </h3>
                <div className="divide-y divide-zinc-800 border-t border-b border-zinc-800">
                  {itens.map((it, idx) => {
                    const materialExibido =
                      it.material === 'Outro (digitar personalizado)'
                        ? it.materialOutro
                        : it.material;
                    return (
                      <div
                        key={idx}
                        className="py-3 flex justify-between items-center text-sm gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#d4af37] text-xs">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="font-bold text-zinc-200">
                              {it.descricao || 'Item sem descrição'}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs pl-6">
                            {materialExibido}
                          </p>
                          {(it.comprimento || it.largura) && (
                            <p className="text-zinc-500 text-xs pl-6">
                              Medidas: {it.comprimento || '0'} × {it.largura || '0'} m
                            </p>
                          )}
                        </div>
                        <div className="text-right font-bold text-zinc-100 whitespace-nowrap">
                          {formatarMoeda(it.valor)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex justify-between items-center text-zinc-100">
                  <span className="font-bold text-sm">TOTAL DOS ITENS</span>
                  <span className="font-black text-xl text-[#d4af37]">
                    {formatarMoeda(subtotalItens)}
                  </span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg text-xs space-y-1.5 border border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Pagamento parcelado:</span>
                    <span className="font-semibold text-zinc-200">
                      Até 5x de {formatarMoeda(subtotalItens / 5)} sem juros no cartão
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-400">
                      À vista ({descontoAVista}% de desconto):
                    </span>
                    <span className="font-bold text-emerald-400">
                      {formatarMoeda(valorAVista)}
                    </span>
                  </div>
                </div>

                {incluirInstalacao && (
                  <div className="p-3 bg-zinc-950 rounded-lg border border-[#d4af37]/30 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-zinc-200">
                      <span>SERVIÇO DE INSTALAÇÃO</span>
                      <span>{formatarMoeda(valorInstalacaoNum)}</span>
                    </div>
                    <p className="text-zinc-500 text-[11px]">
                      Incluso: mão de obra, cantoneiras, silicone, massa plástica, argamassa e cimento.
                    </p>
                    <div className="flex justify-between items-center font-black text-sm text-zinc-100 border-t border-zinc-800 pt-1.5 mt-1.5">
                      <span>TOTAL COM INSTALAÇÃO:</span>
                      <span className="text-[#d4af37]">
                        {formatarMoeda(totalComInstalacao)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
                <p className="font-semibold text-zinc-400">
                  Validade desta proposta: 7 dias a contar da data de emissão.
                </p>
                <p>Obrigado pela preferência! ALFA GRANITOS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}