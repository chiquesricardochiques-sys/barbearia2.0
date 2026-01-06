// src/models/diaNullModel.js
const db = require('./db');

// Listar dias bloqueados de um profissional a partir de hoje
async function listarDiasBloqueados(profissional_id) {
    const hoje = new Date().toISOString().split('T')[0]; // pega data de hoje YYYY-MM-DD
    const sql = `
        SELECT * FROM dia_null 
        WHERE profissional_id = ? AND data >= ?
        ORDER BY data
    `;
    const [rows] = await db.execute(sql, [profissional_id, hoje]);
    return rows;
}

// Criar bloqueio de dia
async function criarDiaBloqueado(profissional_id, data, motivo) {
    const hoje = new Date().toISOString().split('T')[0];
    if (data < hoje) return; // não permite datas passadas

    const sql = 'INSERT INTO dia_null (profissional_id, data, motivo) VALUES (?, ?, ?)';
    await db.execute(sql, [profissional_id, data, motivo || null]);
}

// Deletar bloqueio de dia
async function deletarDiaBloqueado(id) {
    const sql = 'DELETE FROM dia_null WHERE id = ?';
    await db.execute(sql, [id]);
}

// Verificar se um dia está bloqueado
async function verificarDiaBloqueado(profissional_id, data) {
    const sql = 'SELECT * FROM dia_null WHERE profissional_id = ? AND data = ?';
    const [rows] = await db.execute(sql, [profissional_id, data]);
    return rows.length > 0;
}

module.exports = {
    listarDiasBloqueados,
    criarDiaBloqueado,
    deletarDiaBloqueado,
    verificarDiaBloqueado
};
