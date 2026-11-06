import { injectable, inject } from 'inversify';
import { TYPES } from '../container/types';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { ProductFactory } from '../domain/ProductFactory';
import { IPaymentMethod } from '../payment/IPaymentMethod';
import { PaymentMethodRegistry } from '../payment/PaymentMethodRegistry';
import { NotificationService } from './NotificationService';
import { IProduct } from '../domain/IProduct';
import logger from '../lib/logger';

export class EmptyCartError extends Error {
    constructor() {
        super('Carrinho vazio');
        this.name = 'EmptyCartError';
    }
}

export class ProductNotFoundError extends Error {
    constructor(productId: number | string) {
        super(`Produto ${productId} não encontrado`);
        this.name = 'ProductNotFoundError';
    }
}

export class UnsupportedPaymentMethodError extends Error {
    constructor(method: string) {
        super(`Método de pagamento não suportado: ${method}`);
        this.name = 'UnsupportedPaymentMethodError';
    }
}

export class PaymentRefusedError extends Error {
    constructor() {
        super('Pagamento recusado');
        this.name = 'PaymentRefusedError';
    }
}

export interface OrderItem {
    productId: number;
    quantity: number;
}

export interface ProcessOrder {
    customer: string;
    items: OrderItem[];
    paymentMethod: string;
    paymentDetails: Record<string, unknown>;
}

export interface ProcessOrderResult {
    orderId: number;
    totalAmount: number;
    emailPreview: string | false;
}

@injectable()
export class OrderService {
    constructor(
        @inject(TYPES.OrderRepository) private readonly orderRepository: IOrderRepository,
        @inject(TYPES.NotificationService) private readonly notificationService: NotificationService,
        @inject(TYPES.ProductFactory) private readonly productFactory: ProductFactory,
        @inject(TYPES.PaymentMethodRegistry) private readonly paymentMethodRegistry: PaymentMethodRegistry,
    ) {}

    async processOrder(input: ProcessOrder): Promise<ProcessOrderResult> {
        const { customer, items, paymentMethod, paymentDetails } = input;
        if (items.length === 0) {
            logger.error('Tentativa de pedido sem itens');
            throw new EmptyCartError();
        }

        const products: Array<IProduct & { quantity: number }> = [];
        let totalAmount = 0;

        for (const item of items) {
            const productFromDb = await this.orderRepository.findProductById(item.productId);

            if (productFromDb === null) {
                throw new ProductNotFoundError(item.productId);
            }

            const product = this.productFactory.create(productFromDb);
            totalAmount += product.price * item.quantity;
            totalAmount += product.calculateFreight(item.quantity);
            products.push(Object.assign(product, { quantity: item.quantity }));
        }
        
        const paymentMethodInstance: IPaymentMethod = this.paymentMethodRegistry.get(paymentMethod);
        const paymentResult = await paymentMethodInstance.process({
            amount: totalAmount,
            details: paymentDetails,
        });

        if (paymentResult.status !== 'aprovada') {
            throw new PaymentRefusedError();
        }

        const itemsForStorage = [];

        for (const product of products) {
            itemsForStorage.push({
                id: product.id,
                name: product.name,
                price: product.price,
                type: product.type,
                quantity: product.quantity,
            });
        }

        const order = await this.orderRepository.create({
            customer: customer,
            items: JSON.stringify(itemsForStorage),
            total: totalAmount,
            status: 'confirmed',
        });

        const result = await this.notificationService.sendOrderConfirmation({
            orderId: order.id,
            customer,
            totalAmount,
            products,
        });

        return {
            orderId: order.id,
            totalAmount,
            emailPreview: result.previewUrl,
        };
    }
}