const clientModel = require('../models/clientModel');
const servicoModel = require('../models/serviceModel');
const professionalModel = require('../models/professionalModel');
const siteTextModel = require('../models/siteTextsModel');
const commentModel = require('../models/commentModel');

async function mostrarCadastro(req, res) {
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
        // console.log(t.value)
    });
    res.render('public/register', { layout: 'main',textos, register:true,navbarPublic:true});
}

async function registrarCliente(req, res) {
    const { nome, email, telefone, senha } = req.body;
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
        // console.log(t.value)
    });
    const clienteExistente = await clientModel.buscarClientePorEmail(email);
    if (clienteExistente) {
        return res.render('public/register', { error: 'Email já cadastrado!' , textos,register:true,navbarPublic:true});
    }

    await clientModel.criarCliente(nome, email, telefone, senha);
    res.render('public/login', { layout: "main",textos,success: 'Cadastro realizado com sucesso!' , register:true,navbarPublic:true});
}


async function mostrarLogin(req, res) {
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
        // console.log(t.value)
    });
    res.render('public/login', { textos,register:true,navbarPublic:true});
}

async function loginCliente(req, res) {
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
        // console.log(t.value)
    });
    const { email, senha } = req.body;

    const cliente = await clientModel.validarLogin(email, senha);

    if (!cliente) {
        return res.render('public/login', {
            textos,
            error: "Email ou senha incorretos!",
            register:true
            ,navbarPublic:true
        });
    }

    // Salvar sessão
    req.session.cliente = {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
    };

    res.redirect('/client/home');
}

function logoutCliente(req, res) {
    req.session.destroy();
    res.redirect('/');
}

async function home(req, res) {
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
        // console.log(t.value)
    });
    const servicos = await servicoModel.listarServicos();
    const profissionais = await professionalModel.listarProfissionais();
    const comentarios = await commentModel.listarComentarios();

    res.render('public/home', { textos, servicos, profissionais, comentarios });
}

// Tela de recuperar senha
async function mostrarRecuperarSenha(req, res) {
    res.render('public/forgot-password', {
        register:true,
        error: null,
        success: null
    });
}


// Enviar email (simulado por enquanto)
async function enviarRecuperacao(req, res) {
    try {
        const { email } = req.body;

        const cliente = await clientModel.buscarClientePorEmail(email);
        if (!cliente) {
            return res.render('public/forgot-password', {register:true,
                error: 'Email não encontrado',
                success: null
            });
        }

        // Gera e salva token
        const token = await clientModel.salvarTokenRecuperacao(email);

        // 👉 REDIRECIONA PARA RESET DE SENHA
        res.redirect(`/reset-senha?token=${token}`);

    } catch (err) {
        // console.error(err);
        res.render('public/forgot-password', {register:true,
            error: 'Erro ao processar recuperação',
            success: null
        });
    }
}


// Tela de nova senha
async function mostrarResetSenha(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.redirect('/forgot-password');
    }

    res.render('public/reset-password', {register:true, token });
}


// Salvar nova senha
async function resetarSenha(req, res) {
    try {
        const { token, senha } = req.body;

        const cliente = await clientModel.buscarPorToken(token);

        if (!cliente) {
            return res.redirect('/forgot-password?error=Token inválido ou expirado');
        }

        await clientModel.atualizarSenha(cliente.id, senha);

        res.redirect('/login?success=Senha alterada com sucesso');

    } catch (err) {
        // console.error(err);
        res.redirect('/forgot-password?error=Erro ao redefinir senha');
    }
}


module.exports = {
    home,
    mostrarCadastro,
    registrarCliente,
    mostrarLogin,
    loginCliente,
    logoutCliente,
    mostrarRecuperarSenha,
    enviarRecuperacao,
    mostrarResetSenha,
    resetarSenha
};
