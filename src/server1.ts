import debug from 'debug';
import { createServer } from 'node:http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import type { Request, Response } from 'express';

const env = process.env;

// Logger para comprobaciones
const log = debug(` ${env.PROJECT_NAME}`);
log(`Starting node server...`);
console.log('hola', env.PORT);

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

    // Introducimos el puerto como variable de entorno
    const port = process.env || 3000;

    // Iniciamos nuestra aplicación express, por buenas prácticas lo encapsularíamos en una función distinta, voy a mantenerlo aquí para el prototipo de examen
    const app = express();

    // Desactivamos la cabecera automática de express (buena práctica de seguridad)
    app.disable('x-powered-by');
    // Usamos morgan para logs de las peticiones al servidor
    app.use(morgan('dev'));
    // Usamos CORS para permitir realizar peticiones desde dominios diferentes al servidor
    app.use(
        cors({
            origin: '*',
        }),
    );
    // Parsea json
    app.use(express.json());
    // Parsea los "bodies" en las peticiones entrantes
    app.use(express.urlencoded());

    // Ruta por defecto para comprobar el estado del servidor (lo usan sobre todo bots de manera automática)
    app.use('/health', (_req: Request, res: Response) => {
        return res.json({
            status: 'ok',
            timeStamp: new Date().toISOString(),
        });
    });

    // Ruta a la raíz del proyecto
    app.get('/', async (_req: Request, res: Response) => {
        log('Received request to root endpoint');
        return res.send('Hello ROOT');
    });

    // Ruta a la API
    app.get('/api', async (_req: Request, res: Response) => {
        log('Received request to API endpoint');
        return res.send('Hello API');
    });

    // Endpoint para rutas o recursos no encontrados, por buenas prácticas llamaríamos a un manejador de errores al que pasaríamos el error con next, por ahora lo mantenemos aquí para el prototipo
    app.use((_req: Request, res: Response) => {
        log('Calling errorHandler for 404 error');
        const error = new Error('Not Found');
        return res.send(error);
    });

    // Creamos nuestro servidor pasándole nuestra aplicación app
    const server = createServer(app);
    // Ponemos al servidor a escuchar en el puerto
    server.listen(port);
    server.on('listening', listenManager);
};

// Levantamos nuestro servidor
const server = await startServer().catch((error) => {
    log('Error starting server:', error);
    // Cerramos el proceso de node con error (1)
    process.exit(1);
});
