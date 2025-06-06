let indexEditando = null;

function formatCurrency(value) {
  const numeric = value.replace(/\D/g, '');
  const floatValue = (parseFloat(numeric) / 100).toFixed(2);
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

const valorInput = document.getElementById('valor');
setupLiveCurrency(valorInput);

const listaDespesas = document.getElementById('listaDespesas');

function atualizarLista() {
  atualizarTotais();

  listaDespesas.innerHTML = '';
  const registros = JSON.parse(localStorage.getItem('despesas') || '[]');
  registros.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'registro-item';
    div.innerHTML = `
      <span><strong>Data:</strong> ${item.data}</span>
      <span><strong>Descrição:</strong> ${item.descricao}</span>
      <span><strong>Tipo:</strong> ${item.tipo}</span>
      <span><strong>Valor:</strong> R$ ${parseFloat(item.valor).toFixed(2).replace('.', ',')}</span>
    `;
    div.onclick = () => editarRegistro(index);
    listaDespesas.appendChild(div);
  });
}

function atualizarTotais() {
  const totaisDespesas = document.getElementById('totaisDespesas');
  const registros = JSON.parse(localStorage.getItem('despesas') || '[]');
  const totais = {};

  registros.forEach(item => {
    const tipo = item.tipo;
    const valor = parseFloat(item.valor);
    if (!totais[tipo]) totais[tipo] = 0;
    totais[tipo] += valor;
  });

  totaisDespesas.innerHTML = '';
  for (const tipo in totais) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${tipo}:</strong> R$ ${totais[tipo].toFixed(2).replace('.', ',')}`;
    totaisDespesas.appendChild(div);
  }
}

function editarRegistro(index) {
  const registros = JSON.parse(localStorage.getItem('despesas') || '[]');
  const r = registros[index];
  document.getElementById('data').value = r.data;
  document.getElementById('descricao').value = r.descricao;
  document.getElementById('tipo').value = r.tipo;
  valorInput.value = formatCurrency(r.valor);
  indexEditando = index;
  document.getElementById('salvarBtn').textContent = 'Atualizar';
  document.getElementById('salvarBtn').classList.add('editar');
}

function parseBRL(input) {
  return parseFloat(input.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

document.getElementById('despesaForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const valor = parseBRL(valorInput.value);

  const dados = {
    data: document.getElementById('data').value,
    descricao: document.getElementById('descricao').value,
    tipo: document.getElementById('tipo').value,
    valor: valor.toFixed(2)
  };

  const registros = JSON.parse(localStorage.getItem('despesas') || '[]');

  if (indexEditando !== null) {
    registros[indexEditando] = dados;
    indexEditando = null;
    document.getElementById('salvarBtn').textContent = 'Salvar';
    document.getElementById('salvarBtn').classList.remove('editar');
  } else {
    registros.push(dados);
  }

  localStorage.setItem('despesas', JSON.stringify(registros));

  document.getElementById('msgSucesso').textContent = 'Despesa salva com sucesso!';
  document.getElementById('despesaForm').reset();
  valorInput.value = 'R$ 0,00';
  atualizarLista();

  setTimeout(() => {
    document.getElementById('msgSucesso').textContent = '';
  }, 4000);
});

function limparDados() {
  if (confirm('Deseja apagar todas as despesas salvas?')) {
    localStorage.removeItem('despesas');
    atualizarLista();
  }
}

atualizarLista();
