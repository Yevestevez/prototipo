import { env } from './config/env.ts';
import debug from 'debug';
import { createServer } from 'node:http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const log = debug(`Starting node server...`);

// Creamos la interfaz de la entidad <Producto> para que esté correctamente tipada
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

// startServer -> función que envuelve la creación del servidor node con app express
const startServer = async () => {
    // Nos traemos el listenManager para decorar el log de escucha del servidor
    const listenManager = () => {
        const addr = server.address();
        if (addr === null) return;
        let bind;
        if (typeof addr === 'string') {
            bind = 'pipe ' + addr;
        } else {
            bind =
                addr.address === '::'
                    ? `http://localhost:${addr?.port}`
                    : `${addr.address}:${addr?.port}`;
        }
        if (env.NODE_ENV !== 'dev') {
            console.log(`Server listening on ${bind}`);
        } else {
            log(`Server listening from ${bind}`);
        }
    };

    log('Starting API server');

    // introducimos el puerto como variable de entorno
    const port = env.PORT || 3000;
    const app = express();

    app.disable('x-powered-by');

    const server = createServer(app);
    server.listen(port);
    server.on('listening', listenManager);
};
