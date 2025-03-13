import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                gray: '#B1B1B1',
                lightgray: '#EBEBEB',
                darkgray: '#535A56',
                red: '#FF3131',
                orange: '#FF5001',
                green: '#007205',
            },
        },
    },
    plugins: [],
};
export default config;
