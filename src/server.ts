import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import app from "./app";
import { env } from "./lib/config/env";
import { connectDB } from "./lib/db/connection";

const bootstrap = async () => {
  await connectDB();
  app.listen(env.port, () => console.log(`Server running on http://localhost:${env.port}`));
};

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
