function parseFloatSafe(value) {
  return isNaN(parseFloat(value)) ? 0 : parseFloat(value);
}

function atualizarDashboard() {
  const faturamentos = JSON.parse(localStorage.getItem('faturamentos') || '[]');
  const despesas = JSON.parse(localStorage.getItem('despesas') || '[]');

  const totalFaturamento = faturamentos.reduce((acc, item) => acc + parseFloatSafe(item.valor), 0);
  const totalDespesas = despesas.reduce((acc, item) => acc + parseFloatSafe(item.valor), 0);
  const lucroTotal = totalFaturamento - totalDespesas;

  const totalKm = faturamentos.reduce((acc, item) => acc + parseFloatSafe(item.km), 0);
  const diasTrabalhados = [...new Set(faturamentos.map(item => item.data))].length;

  const mediaFaturamento = diasTrabalhados ? totalFaturamento / diasTrabalhados : 0;
  const mediaDespesas = diasTrabalhados ? totalDespesas / diasTrabalhados : 0;
  const mediaLucro = diasTrabalhados ? lucroTotal / diasTrabalhados : 0;

  const ganhoPorKm = totalKm ? totalFaturamento / totalKm : 0;
  const custoPorKm = totalKm ? totalDespesas / totalKm : 0;
  const lucroPorKm = totalKm ? lucroTotal / totalKm : 0;
  const porcentagemLucro = totalFaturamento ? (lucroTotal / totalFaturamento) * 100 : 0;

  const totalPix = faturamentos.reduce((acc, item) => acc + parseFloatSafe(item.pix), 0);
  const totalDinheiro = faturamentos.reduce((acc, item) => acc + parseFloatSafe(item.dinheiro), 0);
  const totalApp = faturamentos.reduce((acc, item) => acc + parseFloatSafe(item.app), 0);

  const cards = document.querySelectorAll('.dashboard .card');

  const setCardValue = (index, valor, prefixo = 'R$') => {
    if (cards[index]) {
      const span = cards[index].querySelector('.value');
      if (span) span.textContent = prefixo + ' ' + valor.toFixed(2).replace('.', ',');
    }
  };

  setCardValue(0, totalFaturamento);
  setCardValue(1, totalDespesas);
  setCardValue(2, lucroTotal);

  if (cards[3]) {
    const span = cards[3].querySelector('.value');
    if (span) span.textContent = Math.round(totalKm) + ' km';
  }

  if (cards[4]) {
    const span = cards[4].querySelector('.value');
    if (span) span.textContent = Math.round(diasTrabalhados) + ' dias';
  }

  setCardValue(5, mediaFaturamento);
  setCardValue(6, mediaDespesas);
  setCardValue(7, mediaLucro);
  setCardValue(8, ganhoPorKm);
  setCardValue(9, custoPorKm);
  setCardValue(10, lucroPorKm);

  if (cards[11]) {
    const span = cards[11].querySelector('.value');
    if (span) span.textContent = porcentagemLucro.toFixed(1).replace('.', ',') + '%';
  }

  setCardValue(12, totalPix);
  setCardValue(13, totalDinheiro);
  setCardValue(14, totalApp);
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarDashboard();

  const botao = document.querySelector('.botao-relatorio');
  if (!botao) return;

  botao.addEventListener('click', () => {
    const faturamentos = JSON.parse(localStorage.getItem('faturamentos') || '[]');
    const despesas = JSON.parse(localStorage.getItem('despesas') || '[]');

    const totalFaturamento = faturamentos.reduce((acc, f) => acc + parseFloatSafe(f.valor), 0);
    const totalDespesas = despesas.reduce((acc, d) => acc + parseFloatSafe(d.valor), 0);
    const lucroTotal = totalFaturamento - totalDespesas;

    const totalKm = faturamentos.reduce((acc, f) => acc + parseFloatSafe(f.km), 0);
    const diasTrabalhados = [...new Set(faturamentos.map(f => f.data))].length;

    const mediaFaturamentoDia = diasTrabalhados ? totalFaturamento / diasTrabalhados : 0;
    const faturamentoPorKm = totalKm ? totalFaturamento / totalKm : 0;
    const custoPorKm = totalKm ? totalDespesas / totalKm : 0;
    const lucroPorKm = totalKm ? lucroTotal / totalKm : 0;
    const porcentagemLucro = totalFaturamento ? (lucroTotal / totalFaturamento) * 100 : 0;

    const totalPix = faturamentos.reduce((acc, f) => acc + parseFloatSafe(f.pix), 0);
    const totalDinheiro = faturamentos.reduce((acc, f) => acc + parseFloatSafe(f.dinheiro), 0);
    const totalApp = faturamentos.reduce((acc, f) => acc + parseFloatSafe(f.app), 0);

    // Agrupar receita por fonte
    const receitasPorFonte = {};
    faturamentos.forEach(f => {
      const desc = (f.descricao || 'Não especificado').trim();
      receitasPorFonte[desc] = (receitasPorFonte[desc] || 0) + parseFloatSafe(f.valor);
    });

    const fontesFormatadas = Object.entries(receitasPorFonte).map(([fonte, valor]) => {
      const percentual = totalFaturamento ? (valor / totalFaturamento) * 100 : 0;
      return `- ${fonte}: ${percentual.toFixed(1).replace('.', ',')}% da receita (R$ ${valor.toFixed(2).replace('.', ',')})`;
    });

    // Categorias de despesas
    const categorias = {
      'Combustível': {},
      'Manutenção': [],
      'Lavagem': [],
      'Seguro': [],
      'Comida': [],
      'Equipamentos': [],
      'Taxas': [],
      'Outros': []
    };

    despesas.forEach(d => {
      const tipo = d.tipo || 'Outros';
      const valor = parseFloatSafe(d.valor);
      const descricao = d.descricao || 'Sem descrição';

      if (tipo === 'Combustível') {
        categorias['Combustível'][descricao] = (categorias['Combustível'][descricao] || 0) + valor;
      } else {
        const linha = `- ${descricao} — R$ ${valor.toFixed(2).replace('.', ',')}`;
        if (categorias[tipo]) {
          categorias[tipo].push(linha);
        } else {
          categorias['Outros'].push(linha);
        }
      }
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;
    const addTitle = (text) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(text, 10, y);
      y += 8;
    };
    const addText = (text) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      text.split('\n').forEach(line => {
        doc.text(line, 12, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
      });
    };

    // Seção 1 – Informações Gerais
    addTitle('Informações Gerais');
    addText(
      `Faturamento mensal: R$ ${totalFaturamento.toFixed(2).replace('.', ',')}\n\n` +
      `Despesa mensal: R$ ${totalDespesas.toFixed(2).replace('.', ',')}\n\n` +
      `Lucro mensal: R$ ${lucroTotal.toFixed(2).replace('.', ',')}\n\n` +
      `KM total rodado: ${Math.round(totalKm)} km\n\n` +
      `Faturamento por KM: R$ ${faturamentoPorKm.toFixed(2).replace('.', ',')}/km\n\n` +
      `Custo por KM: R$ ${custoPorKm.toFixed(2).replace('.', ',')}/km\n\n` +
      `Lucro por KM: R$ ${lucroPorKm.toFixed(2).replace('.', ',')}/km\n\n` +
      `Porcentagem de lucro: ${porcentagemLucro.toFixed(1).replace('.', ',')}%\n\n\n`
    );

    // Seção 2 – Faturamento
    addTitle('Informações sobre Faturamento');
    addText(
      `Faturamento bruto: R$ ${totalFaturamento.toFixed(2).replace('.', ',')}\n\n` +
      `Dias trabalhados: ${diasTrabalhados} dias\n\n` +
      `Fontes da receita:\n${fontesFormatadas.join('\n')}\n\n` +
      `Valor pago em Dinheiro: R$ ${totalDinheiro.toFixed(2).replace('.', ',')}\n\n` +
      `Valor pago via Pix: R$ ${totalPix.toFixed(2).replace('.', ',')}\n\n` +
      `Valor pago pelo App: R$ ${totalApp.toFixed(2).replace('.', ',')}\n\n` +
      `Média de faturamento por dia: R$ ${mediaFaturamentoDia.toFixed(2).replace('.', ',')}\n\n` +
      `Valor médio de faturamento por KM: R$ ${faturamentoPorKm.toFixed(2).replace('.', ',')}/km\n\n\n`
    );

    // Seção 3 – Despesas
    addTitle('Informações sobre as Despesas');
    addText(`Valor total das despesas: R$ ${totalDespesas.toFixed(2).replace('.', ',')}`);

    Object.entries(categorias).forEach(([categoria, itens]) => {
      addText(`\n\n${categoria}:`);
      if (categoria === 'Combustível') {
        const combustiveis = Object.entries(itens);
        if (combustiveis.length === 0) {
          addText('- Nenhum gasto registrado');
        } else {
          combustiveis.forEach(([desc, total]) => {
            addText(`- ${desc}: R$ ${total.toFixed(2).replace('.', ',')}`);
          });
        }
      } else {
        if (itens.length === 0) {
          addText('- Nenhum gasto registrado');
        } else {
          addText(itens.join('\n'));
        }
      }
    });

    addText(`\n\nCusto médio por Km rodado: R$ ${custoPorKm.toFixed(2).replace('.', ',')}/km`);

    doc.save('Relatorio_Mototaxi.pdf');
  });
});
