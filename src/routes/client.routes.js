const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authClient = require('../middlewares/authClient');
const scheduleModel = require('../models/scheduleModel');

// Todas as rotas do cliente precisam de autenticação
router.use(authClient);

// Página inicial do cliente
router.get('/home', clientController.home);

// Rota AJAX para buscar horários disponíveis
router.get('/ajax/horarios', async (req, res) => {
    // console.log("🔥 AJAX CHAMADO!");

    const { profissional_id, data } = req.query;
    // console.log("📌 PARAMS:", profissional_id, data);

    if (!profissional_id || !data) {
        // console.log("❌ Faltam parâmetros");
        return res.json([]);
    }

    try {
        const horarios = await scheduleModel.listarHorariosDisponiveisCliente(profissional_id, data);
        // console.log("📌 RESULTADO:", horarios);
        res.json(horarios);
    } catch (err) {
        // console.error("❌ ERRO NO AJAX:", err);
        res.json([]);
    }
});



// Agendar horário
router.get('/schedule', clientController.mostrarAgendamento);
router.post('/schedule', clientController.agendarHorario);



// Meus agendamentos
router.get('/my-schedules', clientController.meusAgendamentos);
// Deletar agendamento
router.post('/my-schedules/delete', clientController.deletarAgendamento);


// Perfil do cliente
router.get('/profile', clientController.mostrarPerfil);
router.post('/profile', clientController.atualizarPerfil);

module.exports = router;
