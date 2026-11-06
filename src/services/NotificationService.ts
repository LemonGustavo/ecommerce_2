import { IMailProvider } from '../providers/IMailProvider';
import { injectable, inject } from 'inversify';
import { TYPES } from '../container/types'

export interface OrderNotificationData {
    orderId: number;
    customer: string;
    totalAmount: number;
    products: Array<{
        name: string;
        price: number;
        quantity: number;
    }>;
}

@injectable()
export class NotificationService {
    mailProvider: IMailProvider;

    constructor(@inject(TYPES.MailProvider) mailProvider: IMailProvider) {
        this.mailProvider = mailProvider;
    }

    async sendOrderConfirmation(data: OrderNotificationData): Promise<{ previewUrl: string | false }> {
        const orderId = data.orderId;
        const customer = data.customer;
        const totalAmount = data.totalAmount;
        const products = data.products;

        let itemsList = '';

        for (const product of products) {
            const subtotal = product.price * product.quantity;
            itemsList += `<li>${product.name} x ${product.quantity} — R$ ${subtotal.toFixed(2)}</li>`;
        }

        const result = await this.mailProvider.sendMail({
            to: customer,
            subject: `Confirmação do Pedido #${orderId}`,
            text: `Olá, seu pedido #${orderId} no valor de R$ ${totalAmount.toFixed(2)} foi confirmado.`,
            html: `<h1>Pedido Confirmado!</h1>
            <p>Olá, seu pedido <b>#${orderId}</b> foi processado com sucesso.</p>
            <p>Total: <strong>R$ ${totalAmount.toFixed(2)}</strong></p>
            <ul>${itemsList}</ul>`,
        });
    return result;
    }
}