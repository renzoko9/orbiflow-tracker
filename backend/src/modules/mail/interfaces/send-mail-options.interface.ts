export interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}
