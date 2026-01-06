const serviceModel = require('../../models/serviceModel');
const scheduleModel = require('../../models/scheduleModel');
const professionalModel = require('../../models/professionalModel');

async function testPadrao(){
    const siteTextModel = require('../../models/siteTextsModel');
    const textosArray = await siteTextModel.listarTextos();
    const textos = {};
    textosArray.forEach(t => {
        textos[t.key_name] = t.value;
    });



  
    return textos
  }
async function mostrarAgendamento(req, res) {
    const servicos = await serviceModel.listarServicos();
    const profissionais = await professionalModel.listarProfissionais();
    const hoje = new Date().toISOString().split('T')[0];
    // Pega os textos do site
    const textos = await testPadrao()
    let horariosDisponiveis = [];
    if (profissionais.length > 0) {
        horariosDisponiveis = await scheduleModel.listarHorariosDisponiveisAtualizado(profissionais[0].id, hoje);
    }

    // Pegando o serviço padrão via query ?servico_id=3
    const selectedServico = req.query.servico_id 
        ? Number(req.query.servico_id) 
        : (servicos.length > 0 ? servicos[0].id : null);

    res.render('client/schedule', {
        styleClient:"cssConponenteClient/styleSchedule.css",
        servicos,
        textos,
        profissionais,
        currentDate: hoje,
        horariosDisponiveis,
        selectedServico,        // ✅ Passa para o template
        selectedProfissional: profissionais.length > 0 ? profissionais[0].id : null,
        selectedData: hoje,
        client:true
    });
}



async function agendarHorario(req, res) {
    const { servico_id, profissional_id, data, hora, observacoes } = req.body;

    const cliente_id = req.session.cliente.id;
    const textos = await testPadrao()
    // Verifica se já existe agendamento para aquele profissional naquele horário
    const existe = await scheduleModel.verificarHorario(profissional_id, data, hora);
    if (existe) {
        return res.render('client/schedule', {
            error: 'Horário indisponível, escolha outro!',
            styleClient:"cssConponenteClient/styleSchedule.css",
            servicos: await serviceModel.listarServicos(),
            profissionais: await professionalModel.listarProfissionais(),
            client:true,
            textos
        });
    }

    await scheduleModel.criarAgendamento(
        cliente_id,
        profissional_id,
        servico_id,
        data,
        hora,
        observacoes || null
    );
    
        // Atualiza os horários após o agendamento
    const servicos = await serviceModel.listarServicos();
    const profissionais = await professionalModel.listarProfissionais();
    const horariosDisponiveis = await scheduleModel.listarHorariosDisponiveisAtualizado(profissional_id, data);

    res.render('client/schedule', {
        success: 'Agendamento realizado com sucesso!',
        styleClient:"cssConponenteClient/styleSchedule.css",
        servicos,
        profissionais,
        currentDate: data,
        selectedProfissional: profissional_id,
        selectedServico: servico_id,
        horariosDisponiveis,
        client:true,
        textos
    });
}

module.exports = {
    mostrarAgendamento,
    agendarHorario
};
