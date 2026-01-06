const db = require('./db');

async function listarComentarios() {
    const [rows] = await db.query('SELECT * FROM comments WHERE ativo = 1');
    return rows;
}

async function listarTodosComentarios() {
    const [rows] = await db.query('SELECT * FROM comments'); // admin vê todos
    return rows;
}

async function criarComentario(nome, comentario, img) {
    return db.query('INSERT INTO comments (nome, comentario, img) VALUES (?, ?, ?)', [nome, comentario, img || '']);
}

async function atualizarComentario(id, nome, comentario, img, ativo) {
    return db.query(
        'UPDATE comments SET nome = ?, comentario = ?, img = ?, ativo = ? WHERE id = ?',
        [nome, comentario, img || '', ativo ? 1 : 0, id]
    );
}

async function deletarComentario(id) {
    return db.query('DELETE FROM comments WHERE id = ?', [id]);
}

// Lista comentários ativos com limite opcional (0 = todos)
async function listarComentariosHome() {
    let sql = 'SELECT * FROM comments WHERE ativo = 1 ORDER BY id DESC LIMIT ?';
        

    const [rows] = await db.query(sql, [5]);
    return rows;
}

module.exports = {
    listarComentariosHome,
    listarComentarios,
    listarTodosComentarios,
    criarComentario,
    atualizarComentario,
    deletarComentario
};
