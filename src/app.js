console.log("esecutando")
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const clientRoutes = require('./routes/client.routes');
const adminRoutes = require('./routes/admin.routes');
const initializeSiteTexts = require('./models/initSiteTexts');
const initializeDatabase = require('./models/initDatabase');
const path = require('path');
const helpers = require('./utils/helpers');

// importe files
const filupload = require('express-fileupload')

const publicRoutes = require('./routes/public.routes');

const app = express();
app.use(session({
    secret: process.env.SESSION_SECRET || "chave123",
    resave: false,
    saveUninitialized: false
}));
app.use(filupload())

// Configuração do Handlebars
const hbs = exphbs.create({
    defaultLayout:false,
    extname: '.handlebars',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: helpers // <-- aqui registramos os helpers
});

// Configuração Handlebars
app.engine('handlebars', hbs.engine); // <-- usar hbs.engine
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Middleware para definir layout por rota

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));


const adminLayout = (req, res, next) => {
    res.locals.layout = 'ADMIN-TEST';
    next();
};

const clientLayout = (req, res, next) => {
    res.locals.layout = 'client';
    next();
};
const publicLayout = (req, res, next) => {
    res.locals.layout = 'main';
    next();
};


// Rotas
app.use('/',publicLayout,publicRoutes);
app.use('/client',clientLayout, clientRoutes);
app.use('/admin',adminLayout, adminRoutes);

app.use((req, res) => {
    res.status(404).render('404');
});
  
// ⚡ Inicialização do banco e textos antes do servidor
async function startServer() {
    const PORT = process.env.PORT || 3000;

    try {
        await initializeDatabase();
        await initializeSiteTexts();
        console.log("Banco inicializado");
    } catch (err) {
        console.error("Erro no banco:", err);
    }

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

startServer();
