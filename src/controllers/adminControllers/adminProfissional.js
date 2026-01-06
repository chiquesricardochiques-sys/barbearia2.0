const professionalModel = require('../../models/professionalModel');

const url_C =`C:/Users/Positivo/Downloads/site-de-cabelerero`

// --- PROFISSIONAIS ---

async function testPadrao(){
    const siteTextModel = require('../../models/siteTextsModel');
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
    });

    return textos
}

// Função para validar nome
function validarNome(nome) {
    return nome && nome.trim() !== '';
}

// Função para tratar upload de imagem
async function processarImagem(req, url_C, imgAntiga = null) {
    if (!req.files || !req.files.img) return imgAntiga;

    const img = Date.now() + '-' + req.files.img.name;
    const uploadPath = `${url_C}/public/img/Profisional/${img}`;

    await req.files.img.mv(uploadPath);

    // Remove imagem antiga
    if (imgAntiga) {
        const fs = require('fs').promises;
        const path = require('path');
        const imgPath = path.join(url_C, 'public', 'img', 'Profisional', imgAntiga);
        try { await fs.unlink(imgPath); } catch (err) {
            //  console.warn('Imagem antiga não encontrada'); 
            }
    }

    return img;
}


// Função para validar nome
function validarNome(nome) {
    return nome && nome.trim() !== '';
}

// Função para tratar upload de imagem
async function processarImagem(req, url_C, imgAntiga = null) {
    if (!req.files || !req.files.img) return imgAntiga;

    const img = Date.now() + '-' + req.files.img.name;
    const uploadPath = `${url_C}/public/img/Profisional/${img}`;

    await req.files.img.mv(uploadPath);

    // Remove imagem antiga
    if (imgAntiga) {
        const fs = require('fs').promises;
        const path = require('path');
        const imgPath = path.join(url_C, 'public', 'img', 'Profisional', imgAntiga);
        try { await fs.unlink(imgPath); } catch (err) {
            //  console.warn('Imagem antiga não encontrada'); 
        }
    }

    return img;
}


async function renderProfissionais(res, options = {}) {
    const textos = await testPadrao()
    const profissionais = await professionalModel.listarProfissionais();
    res.render('admin/manageProfessionals', { 
        adminStyle:"cssConponenteAdmin/styleProfissional.css",
        textos,
        profissionais, ...options });
}


async function mostrarProfissionais(req, res) {
    await renderProfissionais(res);
}

async function criarProfissional(req, res) {
    try {
        const { nome, especialidade } = req.body;

        if (!validarNome(nome)) return await renderProfissionais(res, { error: 'Nome é obrigatório' });

        const img = await processarImagem(req, url_C);

        await professionalModel.criarProfissional(nome, especialidade, img);

        await renderProfissionais(res, { success: 'Profissional criado!' });

    } catch (err) {
        // console.error(err);
        await renderProfissionais(res, { error: 'Erro ao criar profissional' });
    }
}

async function atualizarProfissional(req, res) {
    try {
        const { id, nome, especialidade, ativo, img: imgAntiga } = req.body;

        if (!validarNome(nome)) return await renderProfissionais(res, { error: 'Nome é obrigatório' });

        const img = await processarImagem(req, url_C, imgAntiga);

        await professionalModel.atualizarProfissional(id, nome, especialidade, img, ativo === 'on');

        await renderProfissionais(res, { success: 'Profissional atualizado com sucesso!' });

    } catch (err) {
        // console.error(err);
        await renderProfissionais(res, { error: 'Ocorreu um erro ao atualizar o profissional.' });
    }
}

async function deletarProfissional(req, res) {
    try {
        const { id } = req.params;
        const profissional = await professionalModel.buscarProfissionalPorId(id);

        if (profissional && profissional.img) {
            const fs = require('fs').promises;
            const path = require('path');
            const imgPath = path.join(url_C, 'public', 'img', 'Profisional', profissional.img);
            try { await fs.unlink(imgPath); } catch (err) {
                //  console.warn('Imagem não encontrada'); 
            }
        }

        await professionalModel.deletarProfissional(id);

        await renderProfissionais(res, { success: 'Profissional removido com sucesso!' });

    } catch (err) {
        // console.error(err);
        await renderProfissionais(res, { error: 'Erro ao remover profissional' });
    }
}


module.exports = {
    mostrarProfissionais,
    criarProfissional,
    atualizarProfissional,
    deletarProfissional
}