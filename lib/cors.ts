import Cors from "cors";
import initMiddleware from "./init-middleware";

const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);

export default cors;
