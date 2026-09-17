/**
 * Re-exports the shared contract from `@vitalpulse/shared-schemas` — the
 * same schema `functions/src/submitRequest.ts` validates against
 * server-side (CLAUDE.md non-negotiable #8). Do not redefine here; edit
 * `packages/shared-schemas/src/request.ts` instead.
 */
export {
  requestTypeEnum,
  requestStatusEnum,
  requestBloodSchema,
  reportShortageSchema,
  submitRequestSchema,
} from '@vitalpulse/shared-schemas/src/request';
export type {
  RequestType,
  RequestStatus,
  RequestBloodInput,
  ReportShortageInput,
  SubmitRequestInput,
} from '@vitalpulse/shared-schemas/src/request';
