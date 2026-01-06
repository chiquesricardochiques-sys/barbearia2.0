const professionalModel = require('../../models/professionalModel');
const adminModel = require('../../models/adminModel');
const serviceModel = require('../../models/serviceModel');
const scheduleModel = require('../../models/scheduleModel');
const diaNullModel = require('../../models/diaNullModel');
const orariosNullModel = require('../../models/orariosNullModel');
async function testPadrao(){
    const siteTextModel = require('../../models/siteTextsModel');
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
    });

    return textos
}

function logoutAdmin(req, res) {
    req.session.destroy();
    res.redirect('/');
}
async function loginAdmin(req, res) {
    const textos = await testPadrao() 
    const { email, senha } = req.body;
    const admin = await adminModel.validarLogin(email, senha);

    if (!admin) {
        return res.render('admin/login', { layout:"ADMIN-TEST",
        textos,
        adminStyle:'cssConponenteAdmin/styleLogin.css', error: 'Email ou senha incorretos!' });
    }

    // Salvar sessão
    req.session.admin = {
        id: admin.id,
        nome: admin.nome,
        email: admin.email
    };

    res.redirect('/admin/dashboard');
}
// --- LOGIN ---
async function mostrarLogin(req, res) {
    const textos = await testPadrao()
    res.render('admin/login', {
        adminStyle:'cssConponenteAdmin/styleLogin.css',textos});
}

// --- DASHBOARD ---
async function mostrarDashboard(req, res) {
    const textos = await testPadrao()
    // console.log("lealte padra : ", res.locals.layout)
    res.render('admin/dashboard', {         adminStyle:'cssConponenteAdmin/styleHome.css',textos

    });
}


module.exports = {
    mostrarLogin,
    loginAdmin,
    logoutAdmin,
    mostrarDashboard
}