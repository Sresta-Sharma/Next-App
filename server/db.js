const { Pool } = require("pg");
require("dotenv").config();

// Prefer DATABASE_URL; otherwise build from PG_* vars
const {
  DATABASE_URL,
  PG_USER,
  PG_PASSWORD,
  PG_HOST,
  PG_PORT,
  PG_DATABASE,
  PG_SSL,
} = process.env;

const buildConnectionString = () => {
  if (DATABASE_URL) return DATABASE_URL;
  if (PG_USER && PG_PASSWORD && (PG_HOST || PG_DATABASE)) {
    const host = PG_HOST || "localhost";
    const port = PG_PORT || 5432;
    const db = PG_DATABASE || "postgres";
    return `postgresql://${encodeURIComponent(PG_USER)}:${encodeURIComponent(
      PG_PASSWORD
    )}@${host}:${port}/${db}`;
  }
  return undefined;
};

const connectionString = buildConnectionString();

const ssl = (() => {
  if (PG_SSL === "false" || PG_SSL === "0") return false;
  if (DATABASE_URL && !DATABASE_URL.includes("localhost") && !DATABASE_URL.includes("127.0.0.1")) {
    return { rejectUnauthorized: false };
  }
  return false; // default off for local dev
})();

const pool = new Pool(
  connectionString
    ? { connectionString, ssl }
    : {
        user: PG_USER,
        password: PG_PASSWORD,
        host: PG_HOST,
        port: PG_PORT,
        database: PG_DATABASE,
        ssl,
      }
);

module.exports = pool;
