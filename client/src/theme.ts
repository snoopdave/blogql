/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// Ant Design theme for the neon terminal look. App.css uses the same colors as CSS variables.
// Shared by App.tsx and the Storybook preview, so stories look like the app.

import {theme, ThemeConfig} from 'antd';

export const colors = {
    bg: '#07060d',
    panel: '#110e22',
    line: '#2a2450',
    text: '#d8d4f0',
    dim: '#8a84b0',
    green: '#39ff14',
    cyan: '#00e5ff',
    pink: '#ff2bd6',
    amber: '#ffb000',
    red: '#ff4d6d',
};

export const blogqlTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 15,
        lineHeight: 1.65,
        controlHeight: 42,
        borderRadius: 6,
        colorPrimary: colors.cyan,
        colorInfo: colors.cyan,
        colorSuccess: colors.green,
        colorWarning: colors.amber,
        colorError: colors.red,
        colorLink: colors.cyan,
        colorText: colors.text,
        colorTextSecondary: colors.dim,
        colorBorder: colors.line,
        colorBorderSecondary: colors.line,
        colorBgBase: colors.bg,
        colorBgContainer: colors.panel,
        colorBgElevated: '#16122b',
        colorBgLayout: 'transparent',
    },
    components: {
        Layout: {headerBg: 'rgba(7, 6, 13, 0.85)', bodyBg: 'transparent', footerBg: 'transparent'},
        Menu: {darkItemBg: 'transparent', darkItemSelectedBg: 'rgba(57, 255, 20, 0.08)', darkItemSelectedColor: colors.green},
        Button: {primaryColor: colors.bg},
        Table: {headerBg: 'rgba(255, 43, 214, 0.06)', headerColor: colors.pink},
    },
};
