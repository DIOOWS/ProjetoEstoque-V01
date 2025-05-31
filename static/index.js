document.addEventListener('DOMContentLoaded', () => {
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
                        <td><input type="text" value="${produto.nome}" data-id="${produto.id}" data-campo="nome" class="editavel"></td>
                        <td><input type="number" value="${produto.qtdAtual}" data-id="${produto.id}" data-campo="qtdAtual" class="editavel"></td>
                        <td><input type="number" value="${produto.qtdMin}" data-id="${produto.id}" data-campo="qtdMin" class="editavel"></td>
                        <td><input type="number" value="${produto.qtdMax}" data-id="${produto.id}" data-campo="qtdMax" class="editavel"></td>
                        <td><button class="btnDelete" data-id="${produto.id}">Excluir</button></td>
                    `;
                    tabela.appendChild(tr);
                });

                document.querySelectorAll('.editavel').forEach(input => {
                    input.addEventListener('change', e => {
                        const id = e.target.dataset.id;
                        const campo = e.target.dataset.campo;
                        const valor = e.target.value;

                        fetch('/produtos/' + id, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ campo, valor })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if(data.error) alert(data.error);
                        });
                    });
                });

                document.querySelectorAll('.btnDelete').forEach(btn => {
                    btn.addEventListener('click', e => {
                        const id = e.target.dataset.id;
                        if(confirm('Quer mesmo excluir?')) {
                            fetch('/produtos/' + id, {
                                method: 'DELETE'
                            })
                            .then(res => res.json())
                            .then(data => {
                                carregarProdutos(busca.value);
                            });
                        }
                    });
                });
            });
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const qtdAtual = parseInt(document.getElementById('qtdAtual').value);
        const qtdMin = parseInt(document.getElementById('qtdMin').value);
        const qtdMax = parseInt(document.getElementById('qtdMax').value);

        fetch('/produtos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nome, qtdAtual, qtdMin, qtdMax })
        })
        .then(res => res.json())
        .then(data => {
            form.reset();
            carregarProdutos(busca.value);
        });
    });

    busca.addEventListener('input', e => {
        carregarProdutos(e.target.value);
    });

    carregarProdutos();
});
