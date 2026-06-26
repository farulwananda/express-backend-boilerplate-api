import { describe, expect, it, vi } from "vitest";
import { MailService } from "../../src/modules/mail/mail.service.js";
import { queueEmail } from "../../src/modules/queue/email.queue.js";
import { testConfig } from "../helpers/test-config.js";

describe("mail", () => {
  it("sends email through configured transporter", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "message-1" });
    const mail = new MailService(testConfig.mail, { sendMail });

    await mail.send({
      to: "user@example.com",
      subject: "Hello",
      text: "Body",
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: testConfig.mail.from,
      to: "user@example.com",
      subject: "Hello",
      text: "Body",
      html: undefined,
    });
  });

  it("queues email jobs with send-email kind", async () => {
    const add = vi.fn().mockResolvedValue({ id: "job-1" });
    const queue = { add };

    await queueEmail(queue, {
      to: "user@example.com",
      subject: "Hello",
      text: "Body",
    });

    expect(add).toHaveBeenCalledWith("send-email", {
      kind: "send-email",
      to: "user@example.com",
      subject: "Hello",
      text: "Body",
    });
  });
});
