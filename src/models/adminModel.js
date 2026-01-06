// src/models/adminModel.js
const db = require('./db');
const bcrypt = require('bcrypt');

async function validarLogin(email, senha) {
    const sql = 'SELECT * FROM admin WHERE email = ?';
    const [rows] = await db.execute(sql, [email]);
    const admin = rows[0];
    if (!admin) return null;

    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida) return null;

    return admin;
}
async function atualizarAdmin(id, nome, email) {
    const sql = `
        UPDATE admin
        SET nome = ?, email = ?
        WHERE id = ?
    `;
    return db.execute(sql, [nome, email, id]);
}

async function atualizarSenha(id, novaSenha) {
    const senha_hash = await bcrypt.hash(novaSenha, 10);
    const sql = 'UPDATE admin SET senha_hash = ? WHERE id = ?';
    return db.execute(sql, [senha_hash, id]);
}

async function deletarAdmin(id) {
    const sql = 'DELETE FROM admin WHERE id = ?';
    return db.execute(sql, [id]);
}

async function contarAdmins() {
    const sql = 'SELECT COUNT(*) total FROM admin';
    const [rows] = await db.execute(sql);
    return rows[0].total;
}
async function criarAdmin(nome, email, senha) {
    const senha_hash = await bcrypt.hash(senha, 10);

    const sql = `
        INSERT INTO admin (nome, email, senha_hash)
        VALUES (?, ?, ?)
    `;

    return db.execute(sql, [nome, email, senha_hash]);
}
async function listarAdmins() {
    const sql = `
        SELECT id, nome, email, criado_em
        FROM admin
        ORDER BY criado_em DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
}


module.exports = {
    atualizarSenha,
    atualizarAdmin,
    deletarAdmin,
    contarAdmins,
    validarLogin,
    criarAdmin,
    listarAdmins
};
