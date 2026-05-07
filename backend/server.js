require("dotenv").config();

const { app } = require("./src/app");
const { migrate } = require("./src/models/migrate");

const port = process.env.PORT || 4000;

migrate()
  .then(() => {
    app.listen(port, () => {
      console.log(`API da Carteira Digital rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar o servidor:", error);
    process.exit(1);
  });
