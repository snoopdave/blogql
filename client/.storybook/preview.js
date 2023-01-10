import { initialize, mswDecorator } from 'msw-storybook-addon';
import {worker} from "../src/mocks/browser";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

if (process.env.NODE_ENV === 'development') {
  console.log('Starting Mocked Service Worker');
  const { worker } = require('../src/mocks/browser.ts')
  worker.start()
} else {
  console.log('NOT Starting Mocked Service Worker');
}

// Initialize MSW
initialize();

export const decorators = [mswDecorator];