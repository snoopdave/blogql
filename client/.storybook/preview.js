/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { initialize, mswDecorator } from 'msw-storybook-addon';
import {worker} from "../src/mocks/browser";
import '../public/bundle.css';
import React from 'react';
import {ConfigProvider} from 'antd';
import {blogqlTheme} from '../src/theme';

if (process.env.NODE_ENV === 'development') {
  console.log('Starting Mocked Service Worker');
  const { worker } = require('../src/mocks/browser.ts')
  worker.start()
} else {
  console.log('NOT Starting Mocked Service Worker');
}

// Initialize MSW
initialize();

// Same Ant Design theme as App.tsx, so stories look like the app.
const withTheme = (Story) => React.createElement(ConfigProvider, {theme: blogqlTheme}, React.createElement(Story));

export const decorators = [mswDecorator, withTheme];