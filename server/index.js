import { createApp } from "./app.js";

const port = Number(process.env.PORT || 3001);

createApp().listen(port, () => {
  console.log(`Express API listening on http://127.0.0.1:${port}`);
});
