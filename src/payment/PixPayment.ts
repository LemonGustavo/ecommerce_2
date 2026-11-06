import { IPaymentMethod, IPaymentInput, IPaymentResult } from "./IPaymentMethod";
import logger from "../lib/logger";
import { injectable } from "inversify";

@injectable()
export class PixPayment implements IPaymentMethod {
    key = 'pix';

    async process({amount, details}: IPaymentInput): Promise<IPaymentResult>{
        const pixKey = details.pixKey || '';

        if(pixKey === '') {
            return {transactionId: '', status: 'recusada'};
        }

        logger.info(`gerando cobrança Pix de R$${amount} para chave ${pixKey}`);

        return {
            transactionId: `pix_${Date.now()}`,
            status: 'aprovada',
        };
    }
}