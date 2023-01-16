"use strict";
// t.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
// Sync object
var config = {
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
exports.default = config;
