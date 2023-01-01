import App from "/src/app.svelte";
import Robot from "/src/blind-path-finding/robot";
import "/src/main.css";

new Robot().navigate();

const app = new App({
  target: document.getElementById("app"),
});

export default app;
