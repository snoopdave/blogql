/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema';

// The agent asks Claude for JSON that matches a schema. Tests replace this with a fake.
export interface LLM {
    generate<T>(system: string, prompt: string, schema: ObjectSchema): Promise<T>;
}

export type ObjectSchema = { type: 'object' } & Record<string, unknown>;

export class ClaudeLLM implements LLM {
    private readonly client: Anthropic;

    constructor(private readonly model: string, apiKey?: string) {
        // The SDK retries rate limits and server errors; the workflow task retries the rest.
        this.client = new Anthropic({ apiKey, maxRetries: 2 });
    }

    async generate<T>(system: string, prompt: string, schema: ObjectSchema): Promise<T> {
        const message = await this.client.messages.parse({
            model: this.model,
            max_tokens: 8000,
            system,
            messages: [{ role: 'user', content: prompt }],
            output_config: { format: jsonSchemaOutputFormat(schema as never) },
        });
        if (message.parsed_output == null) {
            throw new Error(`Claude returned no structured output (stop_reason: ${message.stop_reason})`);
        }
        return message.parsed_output as T;
    }
}
