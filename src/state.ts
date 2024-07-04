import { User, HealthCheckResponse } from './types';

export const users: { [key: string]: User } = {};
export const latestHealthCheck: { [key: string]: HealthCheckResponse } = {};
export const lastStatus: { [key: string]: boolean } = {};