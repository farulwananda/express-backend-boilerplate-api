import nodemailer, { type Transporter } from "nodemailer";
import type { AppConfig } from "../../config/index.js";
import type { SendEmailInput } from "./mail.types.js";

type MailTransport = Pick<Transporter, "sendMail">;

export class MailService {
  private readonly transporter: MailTransport;

  constructor(
    private readonly config: AppConfig["mail"],
    transporter?: MailTransport,
  ) {
    this.transporter =
      transporter ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth:
          config.user && config.password
            ? {
                user: config.user,
                pass: config.password,
              }
            : undefined,
      });
  }

  async send(input: SendEmailInput) {
    return this.transporter.sendMail({
      from: this.config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
