import nodemailer, { Transporter } from 'nodemailer';
import { IMailProvider, ISendMail } from './IMailProvider';
import logger from '../lib/logger';
import { injectable } from "inversify";

@injectable()
export class EtherealMailProvider implements IMailProvider {
    clientPromise: Promise<Transporter>;

    constructor() {
        this.clientPromise = this.buildClient();
    }

    async buildClient() {
        const account = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {user: account.user, pass: account.pass},
        });
    }

    async sendMail(data: ISendMail) {
        const client = await this.clientPromise;
        const info = await client.sendMail({
            from: data.from || '"DevStore" <noreply@devstore.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`Email enviado: ${previewUrl}`);
        return {previewUrl};
    }
}