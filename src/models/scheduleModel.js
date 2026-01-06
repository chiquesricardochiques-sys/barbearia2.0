const db = require('./db');
const diaNullModel = require('./diaNullModel');
const orariosNullModel = require('./orariosNullModel');
const professionalScheduleModel = require('./professionalScheduleModel');

// Listar horários disponíveis e agendados de um profissional
async function listarHorarios(profissional_id, data) {
    let sql = `
        SELECT a.id, a.cliente_id, a.data, a.hora, a.status, c.nome as cliente_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        WHERE a.profissional_id = ? AND a.data = ?
        ORDER BY a.hora
    `;
    const [rows] = await db.execute(sql, [profissional_id, data]);
    return rows;
}
async function listarHorariosDisponiveisAtualizado(profissional_id, data) {
    // 1️⃣ Verifica se o dia inteiro está bloqueado
    const diasBloqueados = await diaNullModel.listarDiasBloqueados(profissional_id);
    if (diasBloqueados.some(d => d.data.toISOString().split('T')[0] === data)) {
        return []; // Dia inteiro indisponível
    }

    // 2️⃣ Pega o dia da semana da data
    const diaSemanaNum = new Date(data).getDay(); // 0 (dom) - 6 (sáb)
    const mapDias = ['dom','seg','ter','qua','qui','sex','sab'];
    const diaSemana = mapDias[diaSemanaNum];

    // 3️⃣ Pega grade semanal do profissional
    const grade = await professionalScheduleModel.listarGradeProfissional(profissional_id);
    const diaGrade = grade.find(g => g.dia_semana === diaSemana);
    if (!diaGrade || diaGrade.abre === 0) return []; // Não abre nesse dia

    // 4️⃣ Monta horários com base na abertura, pausa e fechamento
    const horarios = [];
    let horaAtual = diaGrade.abertura;
    const horaFechamento = diaGrade.fechamento;

    function horaSoma(horaStr, minutosAdd) {
        const [h, m] = horaStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h);
        d.setMinutes(m + minutosAdd);
        return d.toTimeString().split(' ')[0].slice(0,5);
    }

    const intervalo = 30; // cada horário é 30 min

    while (horaAtual < horaFechamento) {
        // Ignora horário de pausa
        if (horaAtual >= diaGrade.pausa_inicio && horaAtual < diaGrade.pausa_fim) {
            horaAtual = diaGrade.pausa_fim;
            continue;
        }
        horarios.push(horaAtual);
        horaAtual = horaSoma(horaAtual, intervalo);
    }

    // 5️⃣ Remove horários já agendados
    const [agendadosRows] = await db.execute(
        'SELECT hora FROM agendamentos WHERE profissional_id = ? AND data = ? AND status = "agendado"',
        [profissional_id, data]
    );
    const agendados = agendadosRows.map(r => r.hora.slice(0,5));
    let disponiveis = horarios.filter(h => !agendados.includes(h));

    // 6️⃣ Remove horários bloqueados (orarios_null)
    const bloqueios = await orariosNullModel.listarOrariosBloqueados(profissional_id, data);
    const bloqueados = bloqueios.map(b => b.hora.slice(0,5));
    disponiveis = disponiveis.filter(h => !bloqueados.includes(h));

    return disponiveis; // retorna array tipo ['08:00','08:30',...]
}

// Criar horário disponível (ou bloquear)
async function criarHorario(profissional_id, data, hora) {
    const sql = 'INSERT INTO horarios_disponiveis (profissional_id, data, hora) VALUES (?, ?, ?)';
    await db.execute(sql, [profissional_id, data, hora]);
}

// Remover horário disponível
async function deletarHorario(id) {
    const sql = 'DELETE FROM horarios_disponiveis WHERE id = ?';
    await db.execute(sql, [id]);
}

// Listar horários disponíveis
async function listarHorariosDisponiveis(profissional_id, data) {
    const sql = `
        SELECT * FROM horarios_disponiveis 
        WHERE profissional_id = ? AND data = ? 
        ORDER BY hora
    `;
    const [rows] = await db.execute(sql, [profissional_id, data]);
    return rows;
}


async function verificarHorario(profissional_id, data, hora) {
    const [rows] = await db.execute(
        'SELECT * FROM agendamentos WHERE profissional_id = ? AND data = ? AND hora = ? AND status = "agendado"',
        [profissional_id, data, hora]
    );
    return rows.length > 0;
}


// Criar agendamento
async function criarAgendamento(cliente_id, profissional_id, servico_id, data, hora, observacoes) {
    await db.execute(
        `INSERT INTO agendamentos 
        (cliente_id, profissional_id, servico_id, data, hora, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [cliente_id, profissional_id, servico_id, data, hora, observacoes]
    );
}


async function listarPorCliente(cliente_id) {
    const [rows] = await db.execute(`
        SELECT 
            a.id,
            DATE_FORMAT(a.data, '%d/%m/%Y') AS data,
            DATE_FORMAT(a.hora, '%H:%i') AS hora,
            a.status,
            s.nome AS servico,
            p.nome AS profissional
        FROM agendamentos a
        JOIN servicos s ON a.servico_id = s.id
        JOIN profissionais p ON a.profissional_id = p.id
        WHERE a.cliente_id = ?
        ORDER BY a.data, a.hora
    `, [cliente_id]);

    return rows;
}



// Listar grade semanal
async function listarProfessionalSchedule(profissional_id) {
    const sql = 'SELECT * FROM professional_schedule WHERE profissional_id = ? ORDER BY FIELD(dia_semana, "seg","ter","qua","qui","sex","sab","dom")';
    const [rows] = await db.execute(sql, [profissional_id]);
    return rows;
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



// Listar grade semanal de um profissional
async function listarProfessionalSchedule(profissional_id) {
    const sql = 'SELECT * FROM professional_schedule WHERE profissional_id = ?';
    const [rows] = await db.execute(sql, [profissional_id]);
    return rows;
}

// Listar horários agendados (marcados) de um profissional em uma data
async function listarHorarios(profissional_id, data) {
    const sql = `
        SELECT a.id, a.hora, a.status, c.nome AS cliente_nome
        FROM agendamentos a
        JOIN clientes c ON a.cliente_id = c.id
        WHERE a.profissional_id = ? AND a.data = ?
        ORDER BY a.hora
    `;
    const [rows] = await db.execute(sql, [profissional_id, data]);
    return rows;
}



// Função para listar horários disponíveis para o cliente
// Função para listar horários disponíveis para o cliente
async function listarHorariosDisponiveisCliente(profissional_id, data) {
    // 1️⃣ Verifica se o dia inteiro está bloqueado
    const diaBloqueado = await diaNullModel.verificarDiaBloqueado(profissional_id, data);
    if (diaBloqueado) return []; // Dia inteiro indisponível

    // 2️⃣ Dia da semana
    const diaSemanaNum = new Date(data).getDay();
    const mapDias = ['dom','seg','ter','qua','qui','sex','sab'];
    const diaSemana = mapDias[diaSemanaNum];

    // 3️⃣ Grade semanal
    const grade = await professionalScheduleModel.listarGradeProfissional(profissional_id);
    const diaGrade = grade.find(g => g.dia_semana === diaSemana);
    if (!diaGrade || diaGrade.abre === 0) return [];

    // 4️⃣ Monta horários
    const horarios = [];
    let horaAtual = diaGrade.abertura;
    const horaFechamento = diaGrade.fechamento;

    const intervalo = 30;
    function horaSoma(horaStr, minutosAdd) {
        const [h, m] = horaStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h);
        d.setMinutes(m + minutosAdd);
        return d.toTimeString().split(' ')[0].slice(0,5);
    }

    while (horaAtual < horaFechamento) {
        if (diaGrade.pausa_inicio && diaGrade.pausa_fim) {
            if (horaAtual >= diaGrade.pausa_inicio && horaAtual < diaGrade.pausa_fim) {
                horaAtual = diaGrade.pausa_fim;
                continue;
            }
        }

        horarios.push(horaAtual);
        horaAtual = horaSoma(horaAtual, intervalo);
    }

    // 5️⃣ Agendamentos
    const [agendadosRows] = await db.execute(
        'SELECT hora FROM agendamentos WHERE profissional_id = ? AND data = ? AND status = "agendado"',
        [profissional_id, data]
    );
    const agendados = agendadosRows.map(r => r.hora.slice(0,5));

    // 6️⃣ Bloqueios
    const bloqueios = await orariosNullModel.listarOrariosBloqueados(profissional_id, data);
    const bloqueados = bloqueios.map(b => b.hora.slice(0,5));

    // 7️⃣ Monta retorno para o cliente
    return horarios.map(h => ({
        hora: h,
        disponivel: !agendados.includes(h) && !bloqueados.includes(h),
        agendamento: agendados.includes(h) ? { hora: h } : null
    }));
}



// --------------------------------------
// LISTAR HORÁRIOS DISPONÍVEIS (CLIENTE)
// --------------------------------------
// async function listarHorariosDisponiveisCliente(profissional_id, data) {

//     const diaBloqueado = await diaNullModel.verificarDiaBloqueado(profissional_id, data);
//     if (diaBloqueado) return [];

//     const mapDias = ['dom','seg','ter','qua','qui','sex','sab'];
//     const diaSemana = mapDias[new Date(data).getDay()];

//     const grade = await professionalScheduleModel.listarGradeProfissional(profissional_id);
//     const diaGrade = grade.find(g => g.dia_semana === diaSemana);

//     if (!diaGrade || diaGrade.abre === 0) return [];

//     const horarios = [];
//     let horaAtual = diaGrade.abertura;
//     const horaFechamento = diaGrade.fechamento;

//     const intervalo = 30;
//     function horaSoma(horaStr, add) {
//         const [h, m] = horaStr.split(':').map(Number);
//         const d = new Date();
//         d.setHours(h);
//         d.setMinutes(m + add);
//         return d.toTimeString().slice(0,5);
//     }

//     while (horaAtual < horaFechamento) {

//         if (diaGrade.pausa_inicio && diaGrade.pausa_fim) {
//             if (horaAtual >= diaGrade.pausa_inicio && horaAtual < diaGrade.pausa_fim) {
//                 horaAtual = diaGrade.pausa_fim;
//                 continue;
//             }
//         }

//         horarios.push(horaAtual);
//         horaAtual = horaSoma(horaAtual, intervalo);
//     }

//     const [agendadosRows] = await db.execute(
//         'SELECT hora FROM agendamentos WHERE profissional_id = ? AND data = ? AND status="agendado"',
//         [profissional_id, data]
//     );

//     const agendados = agendadosRows.map(r => r.hora.slice(0,5));

//     const bloqueios = await orariosNullModel.listarOrariosBloqueados(profissional_id, data);
//     const bloqueados = bloqueios.map(b => b.hora.slice(0,5));

//     return horarios.map(h => ({
//         hora: h,
//         disponivel: !agendados.includes(h) && !bloqueados.includes(h),
//         agendamento: agendados.includes(h) ? { hora: h } : null
//     }));
// }

// --------------------------------------
// LISTAR HORÁRIOS AGENDADOS
// --------------------------------------
async function listarHorarios(profissional_id, data) {
    const [rows] = await db.execute(
        `SELECT a.id, a.hora, a.status, c.nome AS cliente_nome
         FROM agendamentos a
         JOIN clientes c ON a.cliente_id = c.id
         WHERE a.profissional_id = ? AND a.data = ?
         ORDER BY a.hora`,
        [profissional_id, data]
    );

    return rows;
}

// --------------------------------------
// LISTAR HORÁRIOS DISPONÍVEIS (ADMIN)
// --------------------------------------
async function listarHorariosDisponiveisAtualizado(profissional_id, data) {

    const diasBloqueados = await diaNullModel.listarDiasBloqueados(profissional_id);

    if (diasBloqueados.some(d => d.data.toISOString().split('T')[0] === data)) {
        return [];
    }

    const mapDias = ['dom','seg','ter','qua','qui','sex','sab'];
    const diaSemana = mapDias[new Date(data).getDay()];

    const grade = await professionalScheduleModel.listarGradeProfissional(profissional_id);
    const diaGrade = grade.find(g => g.dia_semana === diaSemana);
    if (!diaGrade || diaGrade.abre === 0) return [];

    const horarios = [];
    let horaAtual = diaGrade.abertura;
    const horaFechamento = diaGrade.fechamento;

    function horaSoma(horaStr, minutosAdd) {
        const [h, m] = horaStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h);
        d.setMinutes(m + minutosAdd);
        return d.toTimeString().slice(0,5);
    }

    const intervalo = 30;
    while (horaAtual < horaFechamento) {

        if (horaAtual >= diaGrade.pausa_inicio && horaAtual < diaGrade.pausa_fim) {
            horaAtual = diaGrade.pausa_fim;
            continue;
        }

        horarios.push(horaAtual);
        horaAtual = horaSoma(horaAtual, intervalo);
    }

    const [agendadosRows] = await db.execute(
        'SELECT hora FROM agendamentos WHERE profissional_id = ? AND data = ? AND status = "agendado"',
        [profissional_id, data]
    );

    const agendados = agendadosRows.map(r => r.hora.slice(0, 5));

    const bloqueios = await orariosNullModel.listarOrariosBloqueados(profissional_id, data);
    const bloqueados = bloqueios.map(b => b.hora.slice(0, 5));

    return horarios.filter(h => !agendados.includes(h) && !bloqueados.includes(h));
}

// --------------------------------------
// AGENDAMENTO
// --------------------------------------
async function criarAgendamento(cliente_id, profissional_id, servico_id, data, hora, observacoes = null) {
    await db.execute(
        `INSERT INTO agendamentos 
         (cliente_id, profissional_id, servico_id, data, hora, observacoes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cliente_id, profissional_id, servico_id, data, hora, observacoes]
    );
}




// Busca um agendamento pelo ID
async function buscarPorId(id) {
    const [rows] = await db.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
    return rows[0];
}

// Deleta um agendamento pelo ID
async function deletarAgendamento(id) {
    await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);
}

// --------------------------------------
async function listarFuturosPorCliente(cliente_id) {
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const [rows] = await db.query(`
        SELECT 
            a.id,
            a.data,
            a.hora,
            a.status,
            a.observacoes,
            s.nome AS servico,
            p.nome AS profissional

        FROM agendamentos a
        INNER JOIN servicos s ON s.id = a.servico_id
        INNER JOIN profissionais p ON p.id = a.profissional_id

        WHERE a.cliente_id = ?
          AND a.data >= ?
          AND a.status = 'agendado'

        ORDER BY a.data, a.hora
    `, [cliente_id, hoje]);

    return rows;
}



module.exports = {
    listarHorariosDisponiveisCliente,
    listarProfessionalSchedule,
    listarHorarios,
    listarProfessionalSchedule,
    atualizarProfessionalSchedule,
    listarHorariosDisponiveisAtualizado,
    verificarHorario, 
    criarAgendamento, 
    listarPorCliente,
    listarHorarios,
    criarHorario,
    deletarHorario,
    listarHorariosDisponiveis,
    buscarPorId,
    deletarAgendamento,
    listarFuturosPorCliente
};
