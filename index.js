const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const xss = require('xss');

const app = express();

app.use(cors({
  origin: 'https://leonilso.com.br',
  methods: ['POST']
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50 
});
app.use(limiter);

const db = new sqlite3.Database('./data/database.db');

db.run(`
  CREATE TABLE IF NOT EXISTS mensagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    mensagem TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function sanitize(input) {
  return xss(input.trim());
}

app.post('/api/contato', (req, res) => {
  let { nome, email, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).send({ erro: 'Campos obrigatórios' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send({ erro: 'Email inválido' });
  }

  if (mensagem.length < 5) {
    return res.status(400).send({ erro: 'Mensagem muito curta' });
  }

  nome = sanitize(nome);
  email = sanitize(email);
  mensagem = sanitize(mensagem);

  const sql = `INSERT INTO mensagens (nome, email, mensagem) VALUES (?, ?, ?)`;

  db.run(sql, [nome, email, mensagem], function (err) {
    if (err) return res.status(500).send({ erro: 'Erro no banco' });

    res.send({ ok: true });
  });
});

// app.get('/mensagens', (req, res) => {
//   db.all(`SELECT * FROM mensagens ORDER BY data DESC`, [], (err, rows) => {
//     if (err) return res.status(500).send({ erro: 'Erro ao buscar' });
//     res.send(rows);
//   });
// });

app.listen(3001, () => console.log('Servidor rodando em http://localhost:3001'));