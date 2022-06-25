const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],
  daisyui: {
        prefix: "ui-"
    }
};

module.exports = config;
