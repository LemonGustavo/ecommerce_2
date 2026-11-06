import { Request, Response } from 'express';
import { OrderService, EmptyCartError, ProductNotFoundError, UnsupportedPaymentMethodError, PaymentRefusedError } from '../services/OrderService';
import logger from '../lib/logger';
import { injectable, inject } from 'inversify';
import { TYPES } from '../container/types';

@injectable()
export class OrderController {
    private orderService: OrderService;

    constructor(@inject(TYPES.OrderService) orderService: OrderService) {
        this.orderService = orderService;
    }

    async processOrder(req: Request, res: Response): Promise<Response> {
        try {
            const result = await this.orderService.processOrder(req.body);

            return res.json({
                message: 'Pedido processado com sucesso',
                orderId: result.orderId,
                total: result.totalAmount,
                emailPreview: result.emailPreview,
            });
        } catch (error: any) {
            if (error instanceof EmptyCartError) {
                return res.status(400).json({error: error.message});
            }

            if (error instanceof ProductNotFoundError) {
                return res.status(404).json({error: error.message});
            }

            if (error instanceof UnsupportedPaymentMethodError) {
                return res.status(400).json({error: error.message});
            }

            if (error instanceof PaymentRefusedError) {
                return res.status(402).json({error: error.message});
            }

            logger.error(`Erro inesperado ao processar pedido: ${error.message}`);
            return res.status(500).json({error: 'Erro interno'});
        }
    }
}