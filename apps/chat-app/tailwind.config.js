const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        display: 'ARTIFAKT ELEMENT REGULAR,opensans-light,Helvetica Neue Thin,Helvetica Light,sans-serif', // Adds a new `font-display` class
      }
    }
  },
  plugins: [],
};
