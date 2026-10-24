/** Normalized API error: `status` is the HTTP status, `fields` maps input names to messages. */
export class ApiError extends Error {
  constructor(status, message, fields = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}
