// src/models/orariosNullModel.js
const db = require('./db');

// Listar horários bloqueados de um profissional em uma data (apenas datas >= hoje)
async function listarOrariosBloqueados(profissional_id, data) {
    if (!profissional_id || !data) return [];

    const hoje = new Date().toISOString().split('T')[0];
    if (data < hoje) return []; // não retorna horários de datas passadas

    const sql = `
        SELECT * FROM orarios_null 
        WHERE profissional_id = ? AND data = ? 
        ORDER BY hora
    `;
    const [rows] = await db.execute(sql, [profissional_id, data]);
    return rows;
}

// Criar bloqueio de horário
async function criarHorarioBloqueado(profissional_id, data, hora, motivo) {
    const hoje = new Date().toISOString().split('T')[0];
    if (data < hoje) return; // não permite adicionar horário no passado

    const sql = 'INSERT INTO orarios_null (profissional_id, data, hora, motivo) VALUES (?, ?, ?, ?)';
    await db.execute(sql, [profissional_id, data, hora, motivo || null]);
}

// Deletar bloqueio de horário
async function deletarHorarioBloqueado(id) {
    const sql = 'DELETE FROM orarios_null WHERE id = ?';
    await db.execute(sql, [id]);
}

// Verificar se uma hora está bloqueada
async function verificarHoraBloqueada(profissional_id, data, hora) {
    const sql = 'SELECT * FROM orarios_null WHERE profissional_id = ? AND data = ? AND hora = ?';
    const [rows] = await db.execute(sql, [profissional_id, data, hora]);
    return rows.length > 0;
}

module.exports = {
    listarOrariosBloqueados,
    criarHorarioBloqueado,
    deletarHorarioBloqueado,
    verificarHoraBloqueada
};
