import { IPaymentMethod, IPaymentInput, IPaymentResult } from "./IPaymentMethod";
import logger from "../lib/logger";
import { injectable } from "inversify";

@injectable()
export class CreditCardPayment implements IPaymentMethod {
    key = 'credit_card';

    async process({amount, details}: IPaymentInput): Promise<IPaymentResult> {
        const cardNumber = details.cardNumber || '';
        const cvv = details.cvv || '';
        
        if(cardNumber === '' || cvv === '') {
            return {transactionId: '', status: 'recusada'};
        }
        logger.info(`Processando cartão final ${cardNumber.slice(-4)} - R$${amount}`);

        if(cvv === '000') {
            return {transactionId: '', status: 'recusada'};
        }
        return {
            transactionId: `cc_${Date.now()}`,
            status: 'aprovada',
        };
    }
}