const db = require('./db'); // sua conexão MySQL

// Chaves padrão do site
const defaultTexts = [
  { key_name: 'header_title', value: 'Salão de Beleza' },
  { key_name: 'mainbanner_heading', value: 'Veja nossos serviços' },
  { key_name: 'mainbanner_subheading', value: 'Seu lugar para cortes de cabelo e barba' },
  { key_name: 'footer_text', value: '© 2026 Salão de Beleza • Todos os direitos reservados' },
  { key_name: 'mainbanner_img1', value: 'img1.png' },
  { key_name: 'mainbanner_img2', value: 'img2.png' },
  { key_name: 'mainbanner_img3', value: 'img3.png' },
  // Redes sociais
  { key_name: 'facebook', value: '' },
  { key_name: 'instagram', value: '' },
  { key_name: 'whatsapp', value: '' },
  { key_name: 'tiktok', value: '' },
];

async function initializeSiteTexts() {
  for (const item of defaultTexts) {
    await db.query(
      'INSERT INTO site_texts (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_name=key_name',
      [item.key_name, item.value]
    );
  }
  console.log('✅ Chaves do site inicializadas com sucesso!');
}

module.exports = initializeSiteTexts;
