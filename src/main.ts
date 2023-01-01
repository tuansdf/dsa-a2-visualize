import App from "./app.svelte";
import "/src/main.css";

const app = new App({
  target: document.getElementById("app"),
});

export default app;
