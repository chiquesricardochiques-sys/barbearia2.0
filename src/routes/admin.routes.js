const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

// Rotas de login
router.get('/login', adminController.mostrarLogin);
router.post('/login', adminController.loginAdmin);
router.get('/logout', adminController.logoutAdmin);

// Agenda semanal
router.get('/weekly-agenda', authAdmin, adminController.mostrarAgendaSemanal);

// admin
router.get('/admins', authAdmin, adminController.mostrarAdmins);
router.post('/admins/create', authAdmin, adminController.criarAdmin);
router.post('/admins/update', authAdmin, adminController.atualizarAdmin);
router.post('/admins/update-password', authAdmin, adminController.atualizarSenha);
router.get('/admins/delete/:id', authAdmin, adminController.deletarAdmin);


// Mostrar formulário de textos
router.get('/site-texts', authAdmin, adminController.mostrarTextos);

// Atualizar texto
router.post('/site-texts', authAdmin, adminController.atualizarTexto);
router.post('/site-texts/upload', adminController.uploadImagem);
// dashboard
router.get('/mostrarDashboardAgendamentos', adminController.mostrarDashboardAgendamentos);


// Comentários
router.get('/comments', authAdmin, adminController.mostrarComentarios);
router.post('/comments', authAdmin, adminController.criarComentario);
router.post('/comments/update', authAdmin, adminController.atualizarComentario);
router.get('/comments/delete/:id', authAdmin, adminController.deletarComentario);


// Bloqueios de dias e horários
router.get('/blocks', authAdmin, adminController.mostrarBloqueios);
router.post('/blocks/day', authAdmin, adminController.adicionarDiaBloqueado);
router.post('/blocks/hour', authAdmin, adminController.adicionarHoraBloqueada);
router.get('/blocks/delete/day/:id', authAdmin, adminController.removerDiaBloqueado);
router.get('/blocks/delete/hour/:id', authAdmin, adminController.removerHoraBloqueada);


// Configuração da grade semanal
router.get('/professional-schedule/:profissional_id', authAdmin, adminController.mostrarProfessionalSchedule);
router.post('/professional-schedule/:profissional_id', authAdmin, adminController.atualizarProfessionalSchedule);

// Configurar horários semanais
router.get('/professionals/schedule/:id', authAdmin, adminController.mostrarSchedule);
router.post('/professionals/schedule/:id', authAdmin, adminController.atualizarSchedule);



// Rotas protegidas
router.get('/dashboard', authAdmin, adminController.mostrarDashboard);

// --- PROFISSIONAIS ---
router.get('/professionals', authAdmin, adminController.mostrarProfissionais);
router.post('/professionals', authAdmin, adminController.criarProfissional);
router.post('/professionals/update', authAdmin, adminController.atualizarProfissional);
//router.get('/professionals/delete/:id&:img', authAdmin, adminController.deletarProfissional);
router.get(
  '/professionals/delete/:id',
  authAdmin,
  adminController.deletarProfissional
);


// Serviços
router.get('/services', adminController.mostrarServicos);
router.post('/services', adminController.criarServico);
router.post('/services/update', adminController.atualizarServico);
router.get('/services/delete/:id&:img', adminController.deletarServico);

// Horários
router.get('/hours', adminController.mostrarHorarios);
router.post('/hours', adminController.criarHorario);
router.get('/hours/delete', adminController.deletarHorario);

module.exports = router;
