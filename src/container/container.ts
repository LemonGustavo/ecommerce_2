import 'reflect-metadata';
import 'dotenv/config';
import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from './types';
import { PrismaOrderRepository } from '../repositories/PrismaOrderRepository';
import { InMemoryOrderRepository } from '../repositories/InMemoryOrderRepository';
import { EtherealMailProvider } from '../providers/EtherealMailProvider';
import { ConsoleMailProvider } from '../providers/ConsoleMailProvider';
import { CreditCardPayment } from '../payment/CreditCardPayment';
import { PixPayment } from '../payment/PixPayment';
import { PaymentMethodRegistry } from '../payment/PaymentMethodRegistry';
import { ProductFactory } from '../domain/ProductFactory';
import { NotificationService } from '../services/NotificationService';
import { OrderService } from '../services/OrderService';
import { OrderController } from '../controllers/OrderController';

export const container = new Container();

const isTest = process.env.APP_ENV === 'test';

if (isTest) {
    container.bind(TYPES.OrderRepository).to(InMemoryOrderRepository).inSingletonScope();
    container.bind(TYPES.MailProvider).to(ConsoleMailProvider).inSingletonScope();
} else {
    container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());
    container.bind(TYPES.OrderRepository).to(PrismaOrderRepository).inSingletonScope();
    container.bind(TYPES.MailProvider).to(EtherealMailProvider).inSingletonScope();
}

container.bind(TYPES.PaymentMethod).to(CreditCardPayment);
container.bind(TYPES.PaymentMethod).to(PixPayment);
container.bind(TYPES.PaymentMethodRegistry).to(PaymentMethodRegistry);
container.bind(TYPES.ProductFactory).to(ProductFactory);
container.bind(TYPES.NotificationService).to(NotificationService);
container.bind(TYPES.OrderService).to(OrderService);
container.bind(TYPES.OrderController).to(OrderController);