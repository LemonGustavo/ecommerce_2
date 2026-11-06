import { IProduct } from './IProduct';
import { PhysicalProduct } from './PhysicalProduct';
import { DigitalProduct } from './DigitalProduct';
import { injectable } from "inversify";

@injectable()
export class ProductFactory {
    create(product: {id: number; name: string; price: number; type: string}): IProduct {
        if (product.type === 'physical') {
            return new PhysicalProduct(product.id, product.name, product.price);
        }
        if (product.type === 'digital') {
            return new DigitalProduct(product.id, product.name, product.price);
        }
        throw new Error(`Tipo de produto desconhecido: ${product.type}`);
    }
}