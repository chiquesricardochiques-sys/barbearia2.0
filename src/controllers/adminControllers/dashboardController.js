// src/controllers/admin/dashboardController.js
const dashboardModel = require('../../models/dashboardModel');
const db = require('../../models/db');

async function testPadrao(){
  const siteTextModel = require('../../models/siteTextsModel');
  const textosArray = await siteTextModel.listarTextos();
  const textos = {};
  textosArray.forEach(t => {
      textos[t.key_name] = t.value;
  });

  return textos
}

module.exports = {

  async mostrarDashboardAgendamentos(req, res) {
    const textos = await testPadrao()
    try {
      // 1️⃣ Buscar admin pelo ID da session
      const [admin] = await db.query(
        'SELECT id, nome FROM admin WHERE id = ?',
        [req.session.adminId]
      );

      if (!admin) {
        return res.redirect('/admin/login');
      }

      // 2️⃣ Buscar dados do dashboard
      const [
        lucroHoje,
        lucroSemana,
        totalHoje,
        agendaHoje
      ] = await Promise.all([
        dashboardModel.lucroHoje(),
        dashboardModel.lucroSemana(),
        dashboardModel.totalAgendamentosHoje(),
        dashboardModel.listarAgendaHoje()
      ]);

      const agora = new Date();

      const agenda = agendaHoje.map(item => {
        const horaItem = new Date();
        const [h, m] = item.hora.split(':');
        horaItem.setHours(h, m, 0);

        return {
          ...item,
          finalizado: horaItem < agora
        };
      });
      console.log(agendaHoje);  

      // 3️⃣ Renderizar template passando o admin
      res.render('admin/dashboardAgendamento', {
        adminStyle:"cssConponenteAdmin/styleAgendametosClient.css",
        admin,
        textos,
        lucroHoje,
        lucroSemana,
        totalHoje,
        agenda
      });

    } catch (err) {
      // console.error(err);
      res.render('admin/dashboardAgendamento', {
        adminStyle:"cssConponenteAdmin/styleAgendametosClient.css",
        textos,
        admin: { nome: 'Admin' },
        erro: 'Erro ao carregar dashboard'
      });
    }
  }

};
