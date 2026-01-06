// src/models/professionalModel.js
const db = require('./db');

/**
 * Cria um novo profissional
 * @param {string} nome - Nome do profissional (obrigatório)
 * @param {string|null} especialidade - Especialidade (opcional)
 * @param {string|null} img - Nome do arquivo de imagem (opcional)
 */
async function criarProfissional(nome, especialidade, img) {
    if (!nome || nome.trim() === '') {
        throw new Error('Nome do profissional é obrigatório');
    }

    const sql = `
        INSERT INTO profissionais (nome, especialidade, img)
        VALUES (?, ?, ?)
    `;

    const params = [
        nome.trim(),
        especialidade?.trim() || null,
        img || null
    ];

    const [result] = await db.execute(sql, params);
    return result;
}

/**
 * Lista profissionais ativos ou inativos
 * @param {boolean} ativos - true para ativos, false para inativos
 * @returns {Promise<Array>}
 */
async function listarProfissionais(ativos = true) {
    const sql = 'SELECT * FROM profissionais WHERE ativo = ? ORDER BY nome';
    const [rows] = await db.execute(sql, [ativos ? 1 : 0]);
    return rows;
}

/**
 * Busca um profissional pelo ID
 * @param {number} id - ID do profissional
 * @returns {Promise<Object|null>}
 */
async function buscarProfissionalPorId(id) {
    const sql = 'SELECT * FROM profissionais WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
}

/**
 * Atualiza dados de um profissional
 * @param {number} id - ID do profissional
 * @param {string} nome - Nome do profissional (obrigatório)
 * @param {string|null} especialidade - Especialidade
 * @param {string|null} img - Nome do arquivo de imagem (opcional)
 * @param {boolean} ativo - Status ativo ou inativo
 */
async function atualizarProfissional(id, nome, especialidade, img, ativo) {
    if (!nome || nome.trim() === '') {
        throw new Error('Nome do profissional é obrigatório');
    }

    const campos = ['nome = ?','especialidade = ?','ativo = ?'];
    const params = [nome.trim(), especialidade?.trim() || null, ativo ? 1 : 0];

    if (img) {
        campos.splice(2, 0, 'img = ?'); // insere img antes de ativo
        params.splice(2, 0, img);
    }

    params.push(id);

    const sql = `UPDATE profissionais SET ${campos.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(sql, params);
    return result;
}

/**
 * Deleta um profissional pelo ID
 * @param {number} id - ID do profissional
 */
async function deletarProfissional(id) {
    const sql = 'DELETE FROM profissionais WHERE id = ?';
    const [result] = await db.execute(sql, [id]);
    return result;
}



// Lista profissionais para home do cliente (limit = 0 lista todos)
async function listarProfissionaisHome() {
    let sql = 'SELECT * FROM profissionais WHERE ativo = 1 ORDER BY nome';
    

    const [rows] = await db.execute(sql);
    return rows;
}

module.exports = {
    listarProfissionaisHome,
    criarProfissional,
    listarProfissionais,
    buscarProfissionalPorId,
    atualizarProfissional,
    deletarProfissional
};
