document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formProduto');
    const tabela = document.getElementById('tabelaProdutos').querySelector('tbody');
    const buscaInput = document.getElementById('busca');

    // Carrega produtos do backend
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            produtos.forEach(produto => adicionarLinhaNaTabela(produto));
        })
        .catch(err => alert('Erro ao carregar produtos: ' + err));

    // Adiciona produto no backend e na tabela
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const qtdAtual = document.getElementById('qtdAtual').value.trim();
        const qtdMin = document.getElementById('qtdMin').value.trim();
        const qtdMax = document.getElementById('qtdMax').value.trim();

        if (nome && qtdAtual && qtdMin && qtdMax) {
            fetch('/produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome,
                    qtdAtual: parseInt(qtdAtual),
                    qtdMin: parseInt(qtdMin),
                    qtdMax: parseInt(qtdMax)
                })
            })
            .then(res => res.json())
            .then(produto => {
                adicionarLinhaNaTabela(produto);
                form.reset();
            })
            .catch(err => alert('Erro ao adicionar produto: ' + err));
        }
    });

    // Função para criar e adicionar linha na tabela
    function adicionarLinhaNaTabela(produto) {
    const tr = document.createElement('tr');
    tr.dataset.id = produto.id;
    tr.innerHTML = `
        <td contenteditable="true" class="editable" data-campo="nome">${produto.nome}</td>
        <td>
            <button class="btnAdjust decrease">−</button>
            <span class="qtd editable" contenteditable="true" data-campo="qtdAtual">${produto.qtdAtual}</span>
            <button class="btnAdjust increase">+</button>
        </td>
        <td contenteditable="true" class="editable" data-campo="qtdMin">${produto.qtdMin}</td>
        <td contenteditable="true" class="editable" data-campo="qtdMax">${produto.qtdMax}</td>
        <td>
            <button class="btnDelete">🗑️</button>
        </td>
    `;
    tabela.appendChild(tr);
}


    // Ações: Aumentar, Diminuir, Excluir
    tabela.addEventListener('click', function (e) {
        const alvo = e.target;
        const linha = alvo.closest('tr');
        const id = linha.dataset.id;

        if (alvo.classList.contains('increase') || alvo.classList.contains('decrease')) {
            const qtdSpan = linha.querySelector('.qtd');
            let quantidade = parseInt(qtdSpan.textContent);

            if (alvo.classList.contains('increase')) {
                quantidade += 1;
            } else if (alvo.classList.contains('decrease') && quantidade > 0) {
                quantidade -= 1;
            }

            fetch(`/produtos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ campo: 'qtdAtual', valor: quantidade })
            })
            .then(res => {
                if (res.ok) qtdSpan.textContent = quantidade;
                else throw new Error('Erro ao atualizar quantidade');
            })
            .catch(err => alert(err.message));
        }

        if (alvo.classList.contains('btnDelete')) {
            fetch(`/produtos/${id}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (res.ok) linha.remove();
                else throw new Error('Erro ao excluir');
            })
            .catch(err => alert(err.message));
        }
    });

    // Atualiza valor ao sair do campo editável
tabela.addEventListener('blur', function (e) {
    const alvo = e.target;

    if (alvo.classList.contains('editable')) {
        const linha = alvo.closest('tr');
        const id = linha.dataset.id;
        const campo = alvo.dataset.campo;
        const novoValor = campo === 'nome' ? alvo.textContent.trim() : parseInt(alvo.textContent);

        fetch(`/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ campo, valor: novoValor })
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar campo');
        })
        .catch(err => alert(err.message));
    }
}, true);  // Use captura para garantir que o evento pegue antes do input perder foco


    // Busca por nome
    buscaInput.addEventListener('input', function () {
        const termo = buscaInput.value.toLowerCase();
        const linhas = tabela.querySelectorAll('tr');

        linhas.forEach(linha => {
            const nomeProduto = linha.querySelector('td').textContent.toLowerCase();
            linha.style.display = nomeProduto.includes(termo) ? '' : 'none';
        });
    });
});
