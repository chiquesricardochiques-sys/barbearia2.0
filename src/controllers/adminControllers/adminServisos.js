// src/controllers/admin/serviceController.js
const serviceModel = require('../../models/serviceModel');
const fs = require('fs').promises;
const path = require('path');

const UPLOAD_DIR = `C:/Users/Positivo/Downloads/site-de-cabelerero/public/img/servises`;

async function testPadrao(){
    const siteTextModel = require('../../models/siteTextsModel');
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
    });

    return textos
}

// Listar serviços
async function mostrarServicos(req, res) {
    const textos = await testPadrao()
    const servicos = await serviceModel.listarServicos();
    res.render('admin/manageServices', { 
            adminStyle:"cssConponenteAdmin/styleServices.css",textos,servicos });
}

// Criar serviço
async function criarServico(req, res) {
    const textos = await testPadrao()
    const { nome, duracao_min, preco } = req.body;

    if (!nome || !duracao_min || !preco || !req.files?.img) {
        const servicos = await serviceModel.listarServicos();
        return res.render('admin/manageServices', { 
            adminStyle:"cssConponenteAdmin/styleServices.css",
            textos,
            error: 'Todos os campos são obrigatórios', servicos });
    }

    const img = req.files.img.name;
    try {
        await req.files.img.mv(path.join(UPLOAD_DIR, img));
        await serviceModel.criarServico(nome, duracao_min, preco, img);

        const servicos = await serviceModel.listarServicos();
        res.render('admin/manageServices', { 
            adminStyle:"cssConponenteAdmin/styleServices.css",
            textos,
            success: 'Serviço criado com sucesso!', servicos });

    } catch (err) {
        // console.error('Erro ao criar serviço:', err.message);
        const servicos = await serviceModel.listarServicos();
        res.render('admin/manageServices', { 
            adminStyle:"cssConponenteAdmin/styleServices.css",
            textos,
            error: 'Erro ao criar o serviço.', servicos });
    }
}

// Atualizar serviço
async function atualizarServico(req, res) { 
    const textos = await testPadrao()
    const { id, nome, duracao_min, preco, imgName } = req.body;
    let newImgName = imgName;

    try {
        // Substituir imagem, se houver nova
        if (req.files?.img) {
            newImgName = req.files.img.name;
            await fs.unlink(path.join(UPLOAD_DIR, imgName)).catch(() => {}); // ignora erro se não existir
            await req.files.img.mv(path.join(UPLOAD_DIR, newImgName));
        }

        await serviceModel.atualizarServico(id, nome, duracao_min, preco, newImgName);

        const servicos = await serviceModel.listarServicos();
        res.render('admin/manageServices', { 
            adminStyle:"cssConponenteAdmin/styleServices.css",success: 'Serviço atualizado!',
            textos,
            servicos });

    } catch (err) {
        console.error('Erro ao atualizar serviço:', err.message);
        const servicos = await serviceModel.listarServicos();
        res.render('admin/manageServices', 
        {textos,adminStyle:"cssConponenteAdmin/styleServices.css", error: 'Erro ao atualizar serviço.', servicos });
    }
}

// Deletar serviço
async function deletarServico(req, res) {
    const textos = await testPadrao()
    const { id, img } = req.params;

    try {
        await serviceModel.deletarServico(id);
        if (img) await fs.unlink(path.join(UPLOAD_DIR, img)).catch(() => {});

        const servicos = await serviceModel.listarServicos();
        res.render('admin/manageServices', {textos,adminStyle:"cssConponenteAdmin/styleServices.css", success: 'Serviço removido!', servicos });

    } catch (err) {
        // console.error('Erro ao deletar serviço:', err.message);
        const servicos = await serviceModel.listarServicos();
        res.render('admin/manageServices', {textos,adminStyle:"cssConponenteAdmin/styleServices.css", error: 'Erro ao remover serviço.', servicos });
    }
}

module.exports = { 
    mostrarServicos, 
    criarServico, 
    atualizarServico, 
    deletarServico 
};
