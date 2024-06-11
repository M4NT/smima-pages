const express = require("express");
const session = require('express-session');

const bodyParser = require("body-parser");
const mysql = require("mysql");
const os = require("os");

const app = express();
const port = 3000;

app.use(
  session({
    secret: "smimae10", // substitua 'your secret key' por uma chave secreta de sua escolha
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Note que 'secure' deve ser verdadeiro em produção se estiver usando HTTPS
  })
);

// Middleware para analisar dados do corpo da solicitação
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Obtém o endereço IP público da máquina virtual
function getPublicIPAddress() {
  const interfaces = os.networkInterfaces();
  const iface = Object.values(interfaces)
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal);
  return iface ? iface.address : "localhost"; // Retorna "localhost" se não encontrar nenhum IP público
}

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: "48.217.177.92", // IP público da VM
  user: "master", // o novo usuário que você criou
  password: "sm1m4", // a senha do novo usuário
  database: "smima_bdmysql",
});

// Conectando-se ao banco de dados MySQL
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar-se ao banco de dados MySQL:", err);
    throw err;
  }
  console.log("Conexão bem-sucedida ao banco de dados MySQL");
});

// Rota para lidar com o registro de usuários
app.post("/register", (req, res) => {
  const { username, email, password, cpf } = req.body;

  // Executa a consulta SQL para inserir um novo usuário
  db.query(
    "INSERT INTO Users (username, email, password, cpf) VALUES (?, ?, ?, ?)",
    [username, email, password, cpf],
    (err, result) => {
      if (err) {
        console.error("Erro ao inserir o usuário no banco de dados:", err);
        res.status(500).send(`
          <div class="alert alert-danger" role="alert">
            Erro ao processar a solicitação.
          </div>
        `);
      } else {
        console.log("Usuário inserido com sucesso:", result);
        res.redirect('/login.html');
      }
    }
  );
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor Node.js está executando na porta ${port}`);
});
