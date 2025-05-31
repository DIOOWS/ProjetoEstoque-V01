from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY') or 'sua_chave_secreta_aqui'  # importante pra sessão

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SUPABASE_TABLE = 'produtos'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'  # para receber o objeto criado
}

# Simples usuário fixo só pra exemplo (em produção você faria autenticação real)
USUARIOS = {
    'admin': '123456'
}

# Rota da página de login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username in USUARIOS and USUARIOS[username] == password:
            session['user'] = username
            flash('Login efetuado com sucesso!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Usuário ou senha incorretos', 'danger')
            return render_template('login.html')
    else:
        return render_template('login.html')

# Rota para logout
@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Você foi desconectado', 'info')
    return redirect(url_for('login'))

# Decorador para proteger rotas
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            flash('Faça login para acessar essa página', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/produtos', methods=['GET', 'POST'])
@login_required
def produtos():
    if request.method == 'POST':
        data = request.get_json()

        if not all(k in data for k in ['nome', 'qtdAtual', 'qtdMin', 'qtdMax']):
            return jsonify({'error': 'Dados incompletos'}), 400

        response = requests.post(
            f'{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}',
            headers=HEADERS,
            json=data
        )
        if response.status_code in (200, 201):
            produto_criado = response.json()[0] if response.json() else {}
            return jsonify(produto_criado), 201
        else:
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
@login_required
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
