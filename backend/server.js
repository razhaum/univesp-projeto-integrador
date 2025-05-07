
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Importa o driver do SQLite
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());


// Conecta ao banco de dados SQLite (o arquivo pode não existir ainda)
const db = new sqlite3.Database('./univesp.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Aqui você pode criar tabelas se elas não existirem
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            email TEXT UNIQUE
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS conteudo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            texto TEXT,
            autor_id INTEGER,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_edicao DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        // Cria a tabela de versões de conteúdo se não existir
        db.run(`CREATE TABLE IF NOT EXISTS versoes_conteudo (
            id_versao INTEGER PRIMARY KEY AUTOINCREMENT,
            id_conteudo INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            texto TEXT,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_conteudo) REFERENCES conteudo(id)
        )`);
        // Removi a chave estrangeira por simplicidade, adicione se necessário
    }
});

app.post('/api/usuarios/login', async (req, res) => {
    const { usuario, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE usuario = ?';

    db.get(query, [usuario], async (err, row) => {
        if (err) {
            console.error('Erro ao fazer login:', err.message);
            res.status(500).send('Erro ao fazer login');
            return;
        }

        if (!row) {
            res.status(401).send('Usuário ou senha incorretos'); // Não encontrou o usuário
            return;
        }

        // Comparar a senha fornecida com a senha hash no banco de dados
        const senhaCorreta = await bcrypt.compare(senha, row.senha);

        if (senhaCorreta) {
            res.status(200).send('Login realizado com sucesso!'); // Ou você pode enviar um token de autenticação aqui
        } else {
            res.status(401).send('Usuário ou senha incorretos'); // Senha incorreta
        }
    });
});


// Rota para cadastrar um novo usuário
app.post('/api/usuarios/cadastro', async (req, res) => {

    const { usuario, senha, email } = req.body;
    const hashedPassword = await bcrypt.hash(senha, 10);
    const query = 'INSERT INTO usuarios (usuario, senha, email) VALUES (?, ?, ?)';
    db.run(query, [usuario, hashedPassword, email], function(err) {
        if (err) {
            console.error('Erro ao cadastrar usuário:', err.message);
            res.status(500).send('Erro ao cadastrar usuário');
            return;
        }
        res.status(201).send('Usuário cadastrado com sucesso!');
    });
});

// Rota para obter todos os conteúdos
app.get('/api/conteudo', (req, res) => {
    const query = 'SELECT * FROM conteudo';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao obter conteúdos:', err.message);
            res.status(500).send('Erro ao obter conteúdos');
            return;
        }
        res.json(rows);
    });
});


app.put('/api/conteudo/:id', (req, res) => {
    const id = req.params.id;
    const { titulo, texto } = req.body;

    // 1. Buscar a versão atual do conteúdo
    db.get('SELECT titulo, texto FROM conteudo WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar conteúdo para versionar:', err.message);
            return res.status(500).send('Erro ao versionar conteúdo');
        }
        if (!row) {
            return res.status(404).send('Conteúdo não encontrado');
        }

        const { titulo: titulo_anterior, texto: texto_anterior } = row;

        // 2. Inserir a versão anterior na tabela versoes_conteudo
        db.run(
            'INSERT INTO versoes_conteudo (id_conteudo, titulo, texto) VALUES (?, ?, ?)',
            [id, titulo_anterior, texto_anterior],
            function(err) {
                if (err) {
                    console.error('Erro ao salvar versão anterior:', err.message);
                    return res.status(500).send('Erro ao salvar versão anterior');
                }

                // 3. Atualizar o conteúdo principal na tabela conteudo
                db.run(
                    'UPDATE conteudo SET titulo = ?, texto = ?, data_edicao = CURRENT_TIMESTAMP WHERE id = ?',
                    [titulo, texto, id],
                    function(err) {
                        if (err) {
                            console.error('Erro ao atualizar conteúdo:', err.message);
                            return res.status(500).send('Erro ao atualizar conteúdo');
                        }
                        if (this.changes === 0) {
                            return res.status(404).send('Conteúdo não encontrado');
                        }
                        res.status(200).send('Conteúdo atualizado com sucesso (versão anterior salva)!');
                    }
                );
            }
        );
    });
});



app.get('/api/conteudo/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM conteudo WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Erro ao obter conteúdo:', err.message);
            res.status(500).send('Erro ao obter conteúdo');
            return;
        }
        if (!row) {
            res.status(404).send('Conteúdo não encontrado');
            return;
        }
        res.json(row);
    });
});

app.get('/api/versoes/:id_versao', (req, res) => {
    const id_versao = req.params.id_versao;
    const query = 'SELECT titulo, texto, data_criacao FROM versoes_conteudo WHERE id_versao = ?';
    db.get(query, [id_versao], (err, row) => {
        if (err) {
            console.error('Erro ao buscar versão do conteúdo:', err.message);
            res.status(500).send('Erro ao buscar versão do conteúdo');
            return;
        }
        if (!row) {
            res.status(404).send('Versão do conteúdo não encontrada');
            return;
        }
        res.json(row);
    });
});

app.get('/api/conteudo/:id/versoes', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT id_versao, titulo, data_criacao FROM versoes_conteudo WHERE id_conteudo = ? ORDER BY data_criacao DESC';
    db.all(query, [id], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar histórico de versões:', err.message);
            res.status(500).send('Erro ao buscar histórico de versões');
            return;
        }
        res.json(rows);
    });
});

app.post('/api/conteudo/criar', (req, res) => {
    console.log('Rota /api/conteudo/criar foi atingida!'); // Adicione esta linha
    const { titulo, texto } = req.body;
    const autor_id = null;
    const query = 'INSERT INTO conteudo (titulo, texto, autor_id) VALUES (?, ?, ?)';

    db.run(query, [titulo, texto, autor_id], function(err) {
        if (err) {
            console.error('Erro ao criar conteúdo:', err.message);
            res.status(500).send('Erro ao criar conteúdo');
            return;
        }
        res.status(201).send('Conteúdo criado com sucesso!');
    });
});


app.listen(port, () => {
    console.log(`Servidor backend rodando na porta ${port}`);
});