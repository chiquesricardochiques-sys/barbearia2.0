// src/models/serviceModel.js
const db = require('./db');

async function listarServicos() {
    const [rows] = await db.execute('SELECT * FROM servicos ORDER BY criado_em DESC');
    return rows;
}

async function criarServico(nome, duracao_min, preco, img) {
    const sql = 'INSERT INTO servicos (nome, duracao_min, preco, img) VALUES (?, ?, ?, ?)';
    await db.execute(sql, [nome, duracao_min, preco, img]);
}

// Lista serviços com limite opcional (0 = todos)
async function listarServicosHome() {
    const [rows] = await db.execute('SELECT * FROM servicos ORDER BY criado_em DESC');
    return rows;
}


async function atualizarServico(id, nome, duracao_min, preco, imgName) {
    if (imgName) {
        await db.execute(
            'UPDATE servicos SET nome = ?, duracao_min = ?, preco = ?, img = ? WHERE id = ?',
            [nome, duracao_min, preco, imgName, id]
        );
    } else {
        await db.execute(
            'UPDATE servicos SET nome = ?, duracao_min = ?, preco = ? WHERE id = ?',
            [nome, duracao_min, preco, id]
        );
    }
}

async function deletarServico(id) {
    await db.execute('DELETE FROM servicos WHERE id = ?', [id]);
}

module.exports = { listarServicosHome,listarServicos, criarServico, atualizarServico, deletarServico };
