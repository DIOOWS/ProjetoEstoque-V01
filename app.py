
from flask import Flask, render_template, request, jsonify, g
import sqlite3
import os

app = Flask(__name__)

DATABASE = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'produtos.db')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''CREATE TABLE IF NOT EXISTS produtos (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        nome TEXT NOT NULL,
                        qtdAtual INTEGER NOT NULL,
                        qtdMin INTEGER NOT NULL,
                        qtdMax INTEGER NOT NULL
                    )''')
        db.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/produtos', methods=['GET', 'POST'])
def produtos():
    db = get_db()
    if request.method == 'POST':
        data = request.get_json()
        nome = data.get('nome')
        qtdAtual = data.get('qtdAtual')
        qtdMin = data.get('qtdMin')
        qtdMax = data.get('qtdMax')
        if not all([nome, qtdAtual is not None, qtdMin is not None, qtdMax is not None]):
            return jsonify({'error': 'Dados incompletos'}), 400
        db.execute('INSERT INTO produtos (nome, qtdAtual, qtdMin, qtdMax) VALUES (?, ?, ?, ?)', 
                   (nome, qtdAtual, qtdMin, qtdMax))
        db.commit()
        return jsonify({'message': 'Produto adicionado'})
    else:
        cursor = db.execute('SELECT * FROM produtos')
        produtos = [dict(row) for row in cursor.fetchall()]
        return jsonify(produtos)

@app.route('/produtos/<int:id>', methods=['PUT', 'DELETE'])
def produto_id(id):
    db = get_db()
    if request.method == 'PUT':
        data = request.get_json()
        campo = data.get('campo')
        valor = data.get('valor')
        if campo not in ['nome', 'qtdAtual', 'qtdMin', 'qtdMax']:
            return jsonify({'error': 'Campo inválido'}), 400
        db.execute(f'UPDATE produtos SET {campo} = ? WHERE id = ?', (valor, id))
        db.commit()
        return jsonify({'message': 'Produto atualizado'})
    elif request.method == 'DELETE':
        db.execute('DELETE FROM produtos WHERE id = ?', (id,))
        db.commit()
        return jsonify({'message': 'Produto excluído'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
