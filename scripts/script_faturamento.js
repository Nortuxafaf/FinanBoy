let indexEditando = null;

function formatCurrency(value) {
  const numericValue = value.replace(/\D/g, '');
  const floatValue = (parseFloat(numericValue) / 100).toFixed(2);
  return parseFloat(floatValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function setupLiveCurrency(input) {
  input.addEventListener('input', () => {
    input.value = formatCurrency(input.value);
  });

  input.addEventListener('blur', () => {
    if (input.value.trim() === '') {
      input.value = 'R$ 0,00';
    }
  });
}

const appInput = document.getElementById('app');
const dinheiroInput = document.getElementById('dinheiro');
const pixInput = document.getElementById('pix');
const salvarBtn = document.getElementById('salvarBtn');

[appInput, dinheiroInput, pixInput].forEach(setupLiveCurrency);

const listaRegistros = document.getElementById('listaRegistros');

function atualizarLista() {
  listaRegistros.innerHTML = '';
  const registros = JSON.parse(localStorage.getItem('faturamentos') || '[]');
  registros.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'registro-item';
    div.innerHTML = `
      <span><strong>Data:</strong> ${item.data}</span>
      <span><strong>Descrição:</strong> ${item.descricao}</span>
      <span><strong>Valor Total:</strong> R$ ${parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
    `;
    div.onclick = () => editarRegistro(index);
    listaRegistros.appendChild(div);
  });
}

function editarRegistro(index) {
  const registros = JSON.parse(localStorage.getItem('faturamentos') || '[]');
  const r = registros[index];
  document.getElementById('data').value = r.data;
  document.getElementById('descricao').value = r.descricao;
  appInput.value = formatCurrency(r.app);
  dinheiroInput.value = formatCurrency(r.dinheiro);
  pixInput.value = formatCurrency(r.pix);
  document.getElementById('corridas').value = r.corridas;
  document.getElementById('km').value = r.km;
  indexEditando = index;
  salvarBtn.textContent = 'Atualizar';
  salvarBtn.classList.add('editar');
}

function parseBRL(input) {
  return parseFloat(input.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

document.getElementById('faturamentoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const app = parseBRL(appInput.value);
  const dinheiro = parseBRL(dinheiroInput.value);
  const pix = parseBRL(pixInput.value);
  const valorTotal = app + dinheiro + pix;

  const dados = {
    data: document.getElementById('data').value,
    valor: valorTotal.toFixed(2),
    descricao: document.getElementById('descricao').value,
    app: app.toFixed(2),
    dinheiro: dinheiro.toFixed(2),
    pix: pix.toFixed(2),
    corridas: document.getElementById('corridas').value || '0',
    km: document.getElementById('km').value || '0'
  };

  const registros = JSON.parse(localStorage.getItem('faturamentos') || '[]');

  if (indexEditando !== null) {
    registros[indexEditando] = dados;
    indexEditando = null;
    salvarBtn.textContent = 'Salvar';
    salvarBtn.classList.remove('editar');
  } else {
    registros.push(dados);
  }

  localStorage.setItem('faturamentos', JSON.stringify(registros));

  document.getElementById('msgSucesso').textContent = 'Faturamento salvo com sucesso!';
  document.getElementById('faturamentoForm').reset();
  [appInput, dinheiroInput, pixInput].forEach(input => input.value = 'R$ 0,00');
  atualizarLista();

  setTimeout(() => {
    document.getElementById('msgSucesso').textContent = '';
  }, 4000);
});

function limparDados() {
  if (confirm('Tem certeza que deseja apagar todos os dados salvos?')) {
    localStorage.removeItem('faturamentos');
    atualizarLista();
  }
}

atualizarLista();
