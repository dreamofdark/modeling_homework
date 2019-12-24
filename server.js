const simSim  = require('sim-sim-js');
const express    = require('express');
const expressApp = express();
const httpServer = require('http').createServer(expressApp);
const socketIO   = require('socket.io').listen({httpServer, log: true, secure: false});

const simultSimServer = simSim.create.socketIOServer({socketIO: socketIO, period: 100, log: true});

const rootDir = `${__dirname}/public`;

expressApp.use("/sim_sim", express.static(simSim.clientAssets));
expressApp.use(express.static(rootDir));

const port = 3000;

expressApp.listen(port, () => {
    console.log('Server starte');
});





