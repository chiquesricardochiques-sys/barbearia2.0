const db = require('./db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Criar novo cliente
async function criarCliente(nome, email, telefone, senha) {
    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

    const sql = `
        INSERT INTO clientes (nome, email, telefone, senha_hash)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [nome, email, telefone, senha_hash]);
    return result;
}

// Buscar cliente pelo email
async function buscarClientePorEmail(email) {
    const sql = 'SELECT * FROM clientes WHERE email = ?';
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
}

// Validar login
async function validarLogin(email, senha) {
    const cliente = await buscarClientePorEmail(email);

    if (!cliente) return null;

    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaValida) return null;

    return cliente;
}


async function atualizarPerfil(id, nome, email, telefone, senha) {
    let query = 'UPDATE clientes SET nome = ?, email = ?, telefone = ?';
    const params = [nome, email, telefone];

    if (senha && senha.trim() !== '') {
        // Criptografando a senha antes de salvar
        const hash = await bcrypt.hash(senha, 10);
        query += ', senha_hash = ?';
        params.push(hash);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
}

const crypto = require('crypto');

// Gerar token de recuperação
async function salvarTokenRecuperacao(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    const sql = `
        UPDATE clientes 
        SET reset_token = ?, reset_token_expira = ?
        WHERE email = ?
    `;

    await db.execute(sql, [token, expira, email]);
    return token;
}

// Buscar cliente pelo token
async function buscarPorToken(token) {
    const sql = `
        SELECT * FROM clientes 
        WHERE reset_token = ? 
        AND reset_token_expira > NOW()
    `;
    const [rows] = await db.execute(sql, [token]);
    return rows[0];
}

// Atualizar senha
async function atualizarSenha(id, senha) {
    const hash = await bcrypt.hash(senha, SALT_ROUNDS);

    const sql = `
        UPDATE clientes 
        SET senha_hash = ?, reset_token = NULL, reset_token_expira = NULL
        WHERE id = ?
    `;

    await db.execute(sql, [hash, id]);
}

module.exports = {
    atualizarPerfil,
    criarCliente,
    buscarClientePorEmail,
    validarLogin,
    salvarTokenRecuperacao,
    buscarPorToken,
    atualizarSenha
};



