import { PrismaClient } from '@prisma/client';
import { IOrderRepository, ICreateOrder, IOrder } from './IOrderRepository';
import { injectable, inject } from 'inversify';
import { TYPES } from '../container/types';

@injectable()
export class PrismaOrderRepository implements IOrderRepository {
    prisma: PrismaClient;

    constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async create(data: ICreateOrder): Promise<IOrder> {
        const order = await this.prisma.order.create({data: data});
        return order;
    }

    async findProductById(productId: number): Promise<{id: number; name: string; price: number; type: string} | null> {
        const product = await this.prisma.product.findUnique({where: {id: productId}});

        if (product === null) {
            return null;
        }

        return {
            id: product.id,
            name: product.name,
            price: product.price,
            type: product.type,
        };
    }
}