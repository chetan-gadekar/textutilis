/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                theme: {
                    DEFAULT: '#9366ecff',
                    dark: '#9172d1',
                    light: '#c8b4f2',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
