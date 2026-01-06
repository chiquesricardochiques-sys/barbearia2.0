const siteTextsModel = require('../../models/siteTextsModel');
const url_C =`C:/Users/Positivo/Downloads/site-de-cabelerero`



async function processarImagem(req, url_C, imgAntiga = null) {
    if (!req.files || !req.files.file) return imgAntiga;

    const imgFile = req.files.file;
    const img = Date.now() + '-' + imgFile.name;
    const uploadPath = `${url_C}/public/img/imgIntro/${img}`;

    await imgFile.mv(uploadPath);

    // Remove imagem antiga
    if (imgAntiga) {
        const fs = require('fs').promises;
        const path = require('path');
        const imgPath = path.join(url_C, 'public', 'img', 'imgIntro', imgAntiga);

        try {
            await fs.unlink(imgPath);
        } catch {
            // console.warn('Imagem antiga não encontrada');
        }
    }

    return img;
}



async function mostrarTextos(req, res) {
    const textosDB = await siteTextsModel.listarTextos();

    // transformar em objeto { key_name: value }
    const textos = {};
    textosDB.forEach(item => {
        textos[item.key_name] = item.value;
    });

    // definir campos que serão editáveis
    const campos = [
        { key: 'header_title', label: 'Título do Cabeçalho', type: 'text' },
        { key: 'mainbanner_heading', label: 'Título Principal (Banner)', type: 'text' },
        { key: 'mainbanner_subheading', label: 'Subtítulo (Banner)', type: 'text' },
        { key: 'footer_text', label: 'Texto do Rodapé', type: 'text' },
        { key: 'mainbanner_img1', label: 'Imagem 1 do Banner', type: 'file' },
        { key: 'mainbanner_img2', label: 'Imagem 2 do Banner', type: 'file' },
        { key: 'mainbanner_img3', label: 'Imagem 3 do Banner', type: 'file' },
        // redes sociais
        { key: 'facebook', label: 'Facebook', type: 'text' },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'whatsapp', label: 'WhatsApp', type: 'text' },
        { key: 'tiktok', label: 'TikTok', type: 'text' }
    ];

    res.render('admin/manageSiteTexts', { adminStyle: "cssConponenteAdmin/styleTestSite.css", textos, campos });
}


async function atualizarTexto(req, res) {
    const { key_name, value } = req.body;
    await siteTextsModel.atualizarTexto(key_name, value);
    res.redirect('/admin/site-texts');
}
const path = require('path');
const fs = require('fs');


async function uploadImagem(req, res) {
    try {
        const { key_name, imgAntiga } = req.body;

        const img = await processarImagem(req, url_C, imgAntiga);

        if (!img) return res.redirect('/admin/site-texts');

        await siteTextsModel.atualizarTexto(key_name, img);

        res.redirect('/admin/site-texts');
    } catch (err) {
        // console.log(err);
        res.redirect('/admin/site-texts');
    }
}



module.exports = { mostrarTextos, atualizarTexto, uploadImagem };
