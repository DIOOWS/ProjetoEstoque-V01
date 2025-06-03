document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formProduto');
    const tabela = document.getElementById('tabelaProdutos').querySelector('tbody');
    const buscaInput = document.getElementById('busca');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const qtdAtual = document.getElementById('qtdAtual').value.trim();
        const qtdMin = document.getElementById('qtdMin').value.trim();
        const qtdMax = document.getElementById('qtdMax').value.trim();

        if (nome && qtdAtual && qtdMin && qtdMax) {
            adicionarProduto(nome, qtdAtual, qtdMin, qtdMax);
            form.reset();
        }
    });

    function adicionarProduto(nome, qtdAtual, qtdMin, qtdMax) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nome}</td>
            <td><span class="qtd">${qtdAtual}</span></td>
            <td>${qtdMin}</td>
            <td>${qtdMax}</td>
            <td>
                <button class="btnAdjust increase">+</button>
                <button class="btnAdjust decrease">−</button>
                <button class="btnDelete">Excluir</button>
            </td>
        `;
        tabela.appendChild(tr);
    }

    tabela.addEventListener('click', function (e) {
        const alvo = e.target;

        if (alvo.classList.contains('increase') || alvo.classList.contains('decrease')) {
            const linha = alvo.closest('tr');
            const qtdSpan = linha.querySelector('.qtd');
            let quantidade = parseInt(qtdSpan.textContent);

            if (alvo.classList.contains('increase')) {
                quantidade += 1;
            } else if (alvo.classList.contains('decrease') && quantidade > 0) {
                quantidade -= 1;
            }

            qtdSpan.textContent = quantidade;
        }

        if (alvo.classList.contains('btnDelete')) {
            const linha = alvo.closest('tr');
            linha.remove();
        }
    });

    buscaInput.addEventListener('input', function () {
        const termo = buscaInput.value.toLowerCase();
        const linhas = tabela.querySelectorAll('tr');

        linhas.forEach(linha => {
            const nomeProduto = linha.querySelector('td').textContent.toLowerCase();
            linha.style.display = nomeProduto.includes(termo) ? '' : 'none';
        });
    });
});
