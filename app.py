from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_TABLE = 'produtos'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'  # para receber o objeto criado
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/produtos', methods=['GET', 'POST'])
def produtos():
    if request.method == 'POST':
        data = request.get_json()

        # Validação simples:
        if not all(k in data for k in ['nome', 'qtdAtual', 'qtdMin', 'qtdMax']):
            return jsonify({'error': 'Dados incompletos'}), 400

        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}',
            headers=HEADERS,
            json=data
        )
        if response.status_code == 201 or response.status_code == 200:
            # Retorna o produto criado, vem dentro de uma lista
            produto_criado = response.json()[0] if response.json() else {}
            return jsonify(produto_criado), 201
        else:
            # Melhor detalhar o erro vindo do supabase
            return jsonify({'error': 'Erro ao adicionar', 'details': response.text}), 400

    else:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?select=*',
            headers=HEADERS
        )
        if response.ok:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Erro ao buscar produtos'}), 500

@app.route('/produtos/<int:id>', methods=['PUT', 'DELETE'])
def produto_id(id):
    if request.method == 'PUT':
        data = request.get_json()
        campo = data.get('campo')
        valor = data.get('valor')
        if campo not in ['nome', 'qtdAtual', 'qtdMin', 'qtdMax']:
            return jsonify({'error': 'Campo inválido'}), 400

        update_data = {campo: valor}
        response = requests.patch(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?id=eq.{id}',
            headers=HEADERS,
            json=update_data
        )
        if response.ok:
            return jsonify({'message': 'Produto atualizado'})
        else:
            return jsonify({'error': 'Erro ao atualizar'}), 400

    elif request.method == 'DELETE':
        response = requests.delete(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?id=eq.{id}',
            headers=HEADERS
        )
        if response.ok:
            return jsonify({'message': 'Produto excluído'})
        else:
            return jsonify({'error': 'Erro ao excluir'}), 400

if __name__ == '__main__':
    app.run(debug=True)
