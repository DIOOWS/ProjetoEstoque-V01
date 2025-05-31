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
    'Content-Type': 'application/json'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/produtos', methods=['GET', 'POST'])
def produtos():
    if request.method == 'POST':
        data = request.get_json()
        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}',
            headers=HEADERS,
            json=data
        )
        if response.status_code == 201:
            return jsonify({'message': 'Produto adicionado'})
        else:
            return jsonify({'error': 'Erro ao adicionar'}), 400
    else:
        response = requests.get(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?select=*',
            headers=HEADERS
        )
        return jsonify(response.json())

@app.route('/produtos/<int:id>', methods=['PUT', 'DELETE'])
def produto_id(id):
    if request.method == 'PUT':
        data = request.get_json()
        campo = data.get('campo')
        valor = data.get('valor')
        update_data = {campo: valor}
        response = requests.patch(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?id=eq.{id}',
            headers=HEADERS,
            json=update_data
        )
        return jsonify({'message': 'Produto atualizado'})
    elif request.method == 'DELETE':
        response = requests.delete(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}?id=eq.{id}',
            headers=HEADERS
        )
        return jsonify({'message': 'Produto excluído'})

if __name__ == '__main__':
    app.run(debug=True)
