const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  prefix: "ui-",
  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],
  daisyui: {
    prefix: ""
  }
};

module.exports = config;
