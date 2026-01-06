const db = require('./db'); // ou seu arquivo de conexão com o MySQL

async function listarTextos() {
    const [rows] = await db.query('SELECT * FROM site_texts');
    return rows;
}

async function buscarTextoPorKey(key_name) {
    const [rows] = await db.query('SELECT * FROM site_texts WHERE key_name = ?', [key_name]);
    return rows[0];
}

async function atualizarTexto(key_name, value) {
    
    const [result] = await db.query(
        'UPDATE site_texts SET value = ? WHERE key_name = ?',
        [value, key_name]
    );
    return result;
}

module.exports = {
    listarTextos,
    buscarTextoPorKey,
    atualizarTexto
};

