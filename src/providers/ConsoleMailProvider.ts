import { injectable } from "inversify";
import { IMailProvider, ISendMail } from "./IMailProvider";
import logger from "../lib/logger";

@injectable()
export class ConsoleMailProvider implements IMailProvider {
    async sendMail(data: ISendMail): Promise<{ previewUrl: string | false; }> {
        logger.info(`[ConsoleMailProvider] E-mail para: ${data.to}`);
        logger.info(`[ConsoleMailProvider] Assunto: ${data.subject}`);
        logger.info(`[ConsoleMailProvider] Texto: ${data.text}`);
        logger.info(`[ConsoleMailProvider] HTML: ${data.html}`);
        return { previewUrl: false };
    }
}