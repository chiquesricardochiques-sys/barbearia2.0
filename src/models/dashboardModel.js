// src/models/dashboardModel.js
const db = require('./db');

// data atual (YYYY-MM-DD)
const hojeSQL = () => new Date().toISOString().split('T')[0];

module.exports = {

  // ============================
  // LUCRO DO DIA
  // ============================
  async lucroHoje() {
    const [rows] = await db.query(`
      SELECT 
        IFNULL(SUM(s.preco), 0) AS total
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE a.data = ?
        AND a.status = 'concluido'
    `, [hojeSQL()]);

    return rows[0].total;
  },

  // ============================
  // LUCRO DA SEMANA
  // ============================
  async lucroSemana() {
    const [rows] = await db.query(`
      SELECT 
        IFNULL(SUM(s.preco), 0) AS total
      FROM agendamentos a
      JOIN servicos s ON s.id = a.servico_id
      WHERE YEARWEEK(a.data, 1) = YEARWEEK(CURDATE(), 1)
        AND a.status = 'concluido'
    `);

    return rows[0].total;
  },

  // ============================
  // TOTAL DE AGENDAMENTOS HOJE
  // ============================
  async totalAgendamentosHoje() {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM agendamentos
      WHERE data = ?
        AND status = 'agendado'
    `, [hojeSQL()]);

    return rows[0].total;
  },

  // ============================
  // LISTA DE AGENDAMENTOS DE HOJE
  // ============================
  async listarAgendaHoje() {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        a.hora,
        c.nome AS cliente,
        s.nome AS servico,
        p.nome AS profissional,
        a.observacoes  
      FROM agendamentos a
      JOIN clientes c ON c.id = a.cliente_id
      JOIN servicos s ON s.id = a.servico_id
      JOIN profissionais p ON p.id = a.profissional_id
      WHERE a.data = ?
        AND a.status = 'agendado'
      ORDER BY a.hora ASC
    `, [hojeSQL()]);

    return rows;
  }

};
