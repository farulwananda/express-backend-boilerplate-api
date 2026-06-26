import { Queue, Worker, type ConnectionOptions, type JobsOptions } from "bullmq";
import type { Logger } from "../../lib/logger.js";
import type { MailService } from "../mail/mail.service.js";
import type { SendEmailInput } from "../mail/mail.types.js";

export const EMAIL_QUEUE_NAME = "email";

export interface EmailJobData extends SendEmailInput {
  kind: "send-email";
}

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5_000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};

export function createEmailQueue(connection: ConnectionOptions) {
  return new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
    connection,
    defaultJobOptions,
  });
}

export async function queueEmail(queue: Pick<Queue<EmailJobData>, "add">, input: SendEmailInput) {
  return queue.add("send-email", {
    kind: "send-email",
    ...input,
  });
}

export function createEmailWorker(
  connection: ConnectionOptions,
  mailService: MailService,
  logger: Logger,
  concurrency = 5,
) {
  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      await mailService.send(job.data);
    },
    {
      connection,
      concurrency,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, queue: EMAIL_QUEUE_NAME }, "Email job completed");
  });

  worker.on("failed", (job, error) => {
    logger.error({ err: error, jobId: job?.id, queue: EMAIL_QUEUE_NAME }, "Email job failed");
  });

  return worker;
}
