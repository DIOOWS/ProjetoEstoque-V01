// Referências principais
const tabela = document.querySelector('#tabela tbody');
const btnAdicionar = document.getElementById('adicionar');
const inputNome = document.getElementById('nome');
const inputQtdAtual = document.getElementById('qtdAtual');
const inputQtdMin = document.getElementById('qtdMin');
const inputQtdMax = document.getElementById('qtdMax');
const btnExportar = document.getElementById('exportarCSV');
const tabs = document.querySelectorAll('.filter-tabs .tab');

let produtos = [];
let filtroAtual = 'todos';

// Função pra calcular status
function calcularStatus(produto) {
  if (produto.qtdAtual < produto.qtdMin) return 'urgente';
  if (produto.qtdAtual > produto.qtdMax) return 'excesso';
  return 'ok';
}

// Atualiza tabela na tela de acordo com filtro
function atualizarTabela() {
  tabela.innerHTML = '';

  const produtosFiltrados = produtos.filter(prod =>
    filtroAtual === 'todos' || calcularStatus(prod) === filtroAtual
  );

  produtosFiltrados.forEach((produto, index) => {
    const status = calcularStatus(produto);

    const tr = document.createElement('tr');

    // Nome
    const tdNome = document.createElement('td');
    tdNome.textContent = produto.nome;
    tr.appendChild(tdNome);

    // Qtd Atual com botões +/-
    const tdQtdAtual = document.createElement('td');
    const divCounter = document.createElement('div');
    divCounter.classList.add('counter-btns');

    const btnMenos = document.createElement('button');
    btnMenos.textContent = '-';
    btnMenos.onclick = () => {
      if (produto.qtdAtual > 0) {
        produto.qtdAtual--;
        atualizarTabela();
      }
    };

    const inputQtd = document.createElement('input');
    inputQtd.type = 'number';
    inputQtd.value = produto.qtdAtual;
    inputQtd.min = 0;
    inputQtd.onchange = (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 0) val = 0;
      produto.qtdAtual = val;
      atualizarTabela();
    };

    const btnMais = document.createElement('button');
    btnMais.textContent = '+';
    btnMais.onclick = () => {
      produto.qtdAtual++;
      atualizarTabela();
    };

    divCounter.appendChild(btnMenos);
    divCounter.appendChild(inputQtd);
    divCounter.appendChild(btnMais);
    tdQtdAtual.appendChild(divCounter);
    tr.appendChild(tdQtdAtual);

    // Qtd Minima
    const tdQtdMin = document.createElement('td');
    tdQtdMin.textContent = produto.qtdMin;
    tr.appendChild(tdQtdMin);

    // Qtd Máxima
    const tdQtdMax = document.createElement('td');
    tdQtdMax.textContent = produto.qtdMax;
    tr.appendChild(tdQtdMax);

    // Status com cor
    const tdStatus = document.createElement('td');
    tdStatus.textContent = status.toUpperCase();
    tdStatus.classList.add(`status-${status}`);
    tr.appendChild(tdStatus);

    // Botão Excluir
    const tdExcluir = document.createElement('td');
    const btnExcluir = document.createElement('button');
    btnExcluir.classList.add('delete-btn', 'action-btn');
    btnExcluir.innerHTML = '🗑️';
    btnExcluir.title = 'Excluir produto';
    btnExcluir.onclick = () => {
      produtos.splice(index, 1);
      atualizarTabela();
    };
    tdExcluir.appendChild(btnExcluir);
    tr.appendChild(tdExcluir);

    tabela.appendChild(tr);
  });
}

// Adicionar novo produto
btnAdicionar.addEventListener('click', () => {
  const nome = inputNome.value.trim();
  const qtdAtual = parseInt(inputQtdAtual.value);
  const qtdMin = parseInt(inputQtdMin.value);
  const qtdMax = parseInt(inputQtdMax.value);

  if (!nome || isNaN(qtdAtual) || isNaN(qtdMin) || isNaN(qtdMax)) {
    alert('Preencha todos os campos corretamente!');
    return;
  }
  if (qtdMin > qtdMax) {
    alert('Qtd Mínima não pode ser maior que Qtd Máxima!');
    return;
  }
  if (qtdAtual < 0) {
    alert('Qtd Atual não pode ser negativa!');
    return;
  }

  produtos.push({ nome, qtdAtual, qtdMin, qtdMax });

  inputNome.value = '';
  inputQtdAtual.value = '';
  inputQtdMin.value = '';
  inputQtdMax.value = '';

  atualizarTabela();
});

// Filtros de categoria
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filtroAtual = tab.textContent.toLowerCase() === 'todos' ? 'todos' : tab.textContent.toLowerCase();
    atualizarTabela();
  });
});

// Exportar CSV (somente produtos filtrados)
btnExportar.addEventListener('click', () => {
  const produtosFiltrados = produtos.filter(prod =>
    filtroAtual === 'todos' || calcularStatus(prod) === filtroAtual
  );
  if (produtosFiltrados.length === 0) {
    alert('Nenhum produto para exportar!');
    return;
  }

  const header = ['Nome', 'Qtd Atual', 'Qtd Mínima', 'Qtd Máxima', 'Status'];
  const csvRows = [
    header.join(','),
    ...produtosFiltrados.map(prod => {
      const status = calcularStatus(prod);
      return [prod.nome, prod.qtdAtual, prod.qtdMin, prod.qtdMax, status].join(',');
    })
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'produtos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Inicializa tabela vazia
atualizarTabela();
