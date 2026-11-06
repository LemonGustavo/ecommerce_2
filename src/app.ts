import express from 'express';
import { container } from './container/container';
import { TYPES } from './container/types';
import { OrderController } from './controllers/OrderController';

const app = express();
app.use(express.json());
app.set('json spaces', 2);

const orderController = container.get<OrderController>(TYPES.OrderController);

app.post('/orders', (req, res) => orderController.processOrder(req, res));

export default app;