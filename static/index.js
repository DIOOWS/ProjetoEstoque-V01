document.addEventListener('DOMContentLoaded', () => {More actions
    const form = document.getElementById('formProduto');
    const tabela = document.getElementById('tabelaProdutos').getElementsByTagName('tbody')[0];
    const busca = document.getElementById('busca');

    function carregarProdutos(filtro = '') {
        fetch('/produtos')
            .then(res => res.json())
            .then(data => {
                tabela.innerHTML = '';
                data.filter(produto => produto.nome.toLowerCase().includes(filtro.toLowerCase()))
                    .forEach(produto => {
                        const tr = document.createElement('tr');

                        tr.innerHTML = `
                            <td data-label="Nome">
                                <input type="text" value="${produto.nome}" data-id="${produto.id}" data-campo="nome" class="editavel">
                            </td>
                            <td data-label="Quantidade Atual">
                                <button class="btnDecrementar" data-id="${produto.id}" ${produto.qtdAtual <= 0 ? 'disabled' : ''}>
                                    <svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
                                </button>
                                <input type="number" value="${produto.qtdAtual}" data-id="${produto.id}" data-campo="qtdAtual" class="editavel">
                                <button class="btnIncrementar" data-id="${produto.id}">
                                    <svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" /></svg>
                                </button>
                            </td>
                            <td data-label="Quantidade Mínima">
                                <input type="number" value="${produto.qtdMin}" data-id="${produto.id}" data-campo="qtdMin" class="editavel">
@@ -64,9 +70,50 @@
                        }
                    });
                });

                document.querySelectorAll('.btnDecrementar').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const id = btn.dataset.id;
                        const input = btn.parentElement.querySelector('input[data-campo="qtdAtual"]');
                        let valor = parseInt(input.value);
                        if (valor > 0) {
                            valor--;
                            atualizarQuantidade(id, valor, input);
                        }
                    });
                });

                document.querySelectorAll('.btnIncrementar').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const id = btn.dataset.id;
                        const input = btn.parentElement.querySelector('input[data-campo="qtdAtual"]');
                        let valor = parseInt(input.value);
                        valor++;
                        atualizarQuantidade(id, valor, input);
                    });
                });
            });
    }

    function atualizarQuantidade(id, valor, inputElement) {
        fetch('/produtos/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ campo: 'qtdAtual', valor })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.error) {
                inputElement.value = valor;
                carregarProdutos(busca.value); // atualiza os botões também
            } else {
                alert(data.error);
            }
        });
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;