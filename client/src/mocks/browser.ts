/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { setupWorker } from 'msw';
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
