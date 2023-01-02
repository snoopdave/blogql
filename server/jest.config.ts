
// t.config.ts

import type {Config} from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
    preset: 'ts-jest/presets/default-esm',
    verbose: true,
    testMatch: ['**/__tests__/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
            useESM: true
        }],
    },
};
export default config;
