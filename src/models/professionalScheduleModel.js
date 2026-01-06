// src/models/professionalScheduleModel.js
const db = require('./db');

/**
 * Lista a grade semanal de um profissional, ordenando os dias.
 */
async function listarGradeProfissional(profissional_id) {
    const sql = `
        SELECT * FROM professional_schedule
        WHERE profissional_id = ?
        ORDER BY FIELD(dia_semana, "seg","ter","qua","qui","sex","sab","dom")
    `;
    const [rows] = await db.execute(sql, [profissional_id]);
    return rows;
}
// Listar grade semanal
// async function listarProfessionalSchedule(profissional_id) {
//     const sql = 'SELECT * FROM professional_schedule WHERE profissional_id = ?';
//     const [rows] = await db.execute(sql, [profissional_id]);
//     return rows;
// }
async function listarProfessionalSchedule(profissional_id) {
    const sql = 'SELECT * FROM professional_schedule WHERE profissional_id = ? ORDER BY FIELD(dia_semana, "seg","ter","qua","qui","sex","sab","dom")';
    const [rows] = await db.execute(sql, [profissional_id]);
    return rows;
}
/**
 * Cria ou atualiza a grade de um dia específico.
 */
async function criarOuAtualizarGrade(profissional_id, dia_semana, abre, abertura, pausa_inicio, pausa_fim, fechamento) {
    const sql = `
        INSERT INTO professional_schedule (profissional_id, dia_semana, abre, abertura, pausa_inicio, pausa_fim, fechamento)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE abre=?, abertura=?, pausa_inicio=?, pausa_fim=?, fechamento=?
    `;
    await db.execute(sql, [
        profissional_id, dia_semana, abre, abertura, pausa_inicio, pausa_fim, fechamento,
        abre, abertura, pausa_inicio, pausa_fim, fechamento
    ]);
}

/**
 * Remove a grade de um dia específico do profissional.
 */
async function deletarGrade(profissional_id, dia_semana) {
    const sql = 'DELETE FROM professional_schedule WHERE profissional_id = ? AND dia_semana = ?';
    await db.execute(sql, [profissional_id, dia_semana]);
}
// Atualizar grade semanal
async function atualizarProfessionalSchedule(profissional_id, dados) {
    const dias = ['seg','ter','qua','qui','sex','sab','dom'];
    for (let dia of dias) {
        const abre = dados[`${dia}_abre`] === 'on' ? 1 : 0;
        const abertura = dados[`${dia}_abertura`] || '09:00:00';
        const pausa_inicio = dados[`${dia}_pausa_inicio`] || null;
        const pausa_fim = dados[`${dia}_pausa_fim`] || null;
        const fechamento = dados[`${dia}_fechamento`] || '18:00:00';

        const [rows] = await db.execute('SELECT id FROM professional_schedule WHERE profissional_id = ? AND dia_semana = ?', [profissional_id, dia]);

        if (rows.length > 0) {
            await db.execute(
                `UPDATE professional_schedule
                 SET abre = ?, abertura = ?, pausa_inicio = ?, pausa_fim = ?, fechamento = ?
                 WHERE profissional_id = ? AND dia_semana = ?`,
                [abre, abertura, pausa_inicio, pausa_fim, fechamento, profissional_id, dia]
            );
        } else {
            await db.execute(
                `INSERT INTO professional_schedule (profissional_id, dia_semana, abre, abertura, pausa_inicio, pausa_fim, fechamento)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [profissional_id, dia, abre, abertura, pausa_inicio, pausa_fim, fechamento]
            );
        }
    }
}

module.exports = {
    atualizarProfessionalSchedule,
    listarProfessionalSchedule,
    listarGradeProfissional,
    criarOuAtualizarGrade,
    deletarGrade
};
