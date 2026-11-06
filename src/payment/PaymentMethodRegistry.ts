import { injectable, multiInject } from 'inversify';
import { TYPES } from '../container/types';
import { IPaymentMethod } from './IPaymentMethod';
import { UnsupportedPaymentMethodError } from '../services/OrderService';

@injectable()
export class PaymentMethodRegistry {
    private readonly methods: Map<string, IPaymentMethod>;

    constructor(
        @multiInject(TYPES.PaymentMethod) methods: IPaymentMethod[],
    ) {
        this.methods = new Map();
        for (const m of methods) {
            this.methods.set(m.key, m);
        }
    }

    get(key: string): IPaymentMethod {
        const method = this.methods.get(key);
        if (!method) {
            throw new UnsupportedPaymentMethodError(key);
        }
        return method;
    }
}