const http = require('http');
const app = require('./app');

/*
app.post("/health", (req, res) => {
    res.json("Voila ça fonctionne !")
})
*/
app.set('port', process.env.PORT || 3000);

const server = http.createServer(app);

server.listen(process.env.PORT || 3000);