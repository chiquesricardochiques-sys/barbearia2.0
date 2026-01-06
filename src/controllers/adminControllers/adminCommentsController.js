const commentModel = require('../../models/commentModel');
const fs = require('fs').promises;
const path = require('path');

const url_C = `C:/Users/Positivo/Downloads/site-de-cabelerero`;

async function testPadrao(){
    const siteTextModel = require('../../models/siteTextsModel');
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
    });

    return textos
}

// Função auxiliar para salvar imagem e deletar antiga se houver
async function salvarImagem(file, pasta, antigaImg = null) {
    if (!file) return antigaImg || null;
    
    const img = file.name;
    const imgPath = path.join(url_C, 'public', 'img', pasta, img);

    // Deleta imagem antiga, se existir
    if (antigaImg) {
        try {
            await fs.unlink(path.join(url_C, 'public', 'img', pasta, antigaImg));
        } catch (err) {
            // console.log('Falha ao remover imagem antiga:', err.message);
        }
    }

    // Salva nova imagem
    await file.mv(imgPath);
    return img;
}

// Mostrar todos os comentários no admin
async function mostrarComentarios(req, res) {
    const textos = await testPadrao()
    const comentarios = await commentModel.listarTodosComentarios();
    res.render('admin/manageComments', {  
        adminStyle:"cssConponenteAdmin/styleComentarios.css"
        ,
        textos,
        comentarios });
}

// Criar comentário
async function criarComentario(req, res) { 
    const textos = await testPadrao()
    try {
        const { nome, comentario } = req.body;
        const img = await salvarImagem(req.files?.img, 'comentes');
        await commentModel.criarComentario(nome, comentario, img);
        res.redirect('/admin/comments');
    } catch (err) {
        // console.error('Erro ao criar comentário:', err.message);
        const comentarios = await commentModel.listarTodosComentarios();
        res.render('admin/manageComments',textos, {error: 'Erro ao criar comentário.', comentarios });
    }
}

// Atualizar comentário
async function atualizarComentario(req, res) {
    try {
        const { id, nome, comentario, imgName, ativo } = req.body;
        const img = await salvarImagem(req.files?.img, 'comentes', imgName);
        await commentModel.atualizarComentario(id, nome, comentario, img, ativo === 'on');
        res.redirect('/admin/comments');
    } catch (err) {
        // console.error('Erro ao atualizar comentário:', err.message);
        res.redirect('/admin/comments');
    }
}

// Deletar comentário
async function deletarComentario(req, res) {
    try {
        const { id, img } = req.params;
        await commentModel.deletarComentario(id);

        if (img) {
            try {
                await fs.unlink(path.join(url_C, 'public', 'img', 'comentes', img));
            } catch (err) {
                // console.log('Falha ao remover imagem do comentário:', err.message);
            }
        }

        res.redirect('/admin/comments');
    } catch (err) {
        // console.error('Erro ao deletar comentário:', err.message);
        res.redirect('/admin/comments');
    }
}

module.exports = {
    mostrarComentarios,
    criarComentario,
    atualizarComentario,
    deletarComentario
};
