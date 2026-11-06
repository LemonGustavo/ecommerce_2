import { injectable } from "inversify";
import { IOrderRepository, ICreateOrder, IOrder } from "./IOrderRepository";

@injectable()
export class InMemoryOrderRepository implements IOrderRepository {
    private orders: IOrder[] = [];
    private nextId = 1;

    async create(data: ICreateOrder): Promise<IOrder> {
        const order: IOrder = { id: this.nextId++, ...data };
        this.orders.push(order);
        return order;
    }

    async findProductById(productId: number): Promise<{ id: number; name: string; price: number; type: string; } | null> {
        if(productId === 1) {
            return {id: 1, name: 'O Programador Pragmático (Livro Físico)', price: 100, type: 'physical'};
        }
        if(productId === 2) {
            return {id: 2, name: 'Código Limpo (E-book)', price: 50, type: 'digital'};
        }
        return null;
    }
}