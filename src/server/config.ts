import dotenv from 'dotenv';
dotenv.config();

let APP_ID = process.env.APP_ID || 'datasetarchiver';
let LOG_LEVEL = process.env.LOG_LEVEL || '30';
let OPENAPI_SPEC = process.env.OPENAPI_SPEC || '/spec';
let env = process.env.NODE_ENV || 'development';
let protocol = process.env.PROTOCOL || 'http:';
let host = process.env.HOST || 'localhost';
let port = parseInt(process.env.PORT) || 3000;
let endpoint = process.env.ENDPOINT || '';
let DB_Server = process.env.DB_Server || 'localhost:27017';
let DB_Name = process.env.DB_Name || 'archiver';
let CRAWL_API = process.env.CRAWL_API || 'https://k8s.ai.wu.ac.at/crawler/api/v1';
let CRAWL_HostInterval = parseInt(process.env.CRAWL_HostInterval) || 5;
let CRAWL_minRange = parseInt(process.env.CRAWL_minRange) || 15;
let CRAWL_maxRange = parseInt(process.env.CRAWL_maxRange) || 120;
let ErrorCountTreshold = parseInt(process.env.ErrorCountTreshold) || 3;
let MaxFileSizeInBytes = parseInt(process.env.MaxFileSizeInBytes) || 100000000;
let CRAWL_DistributionArrayMax = parseInt(process.env.CRAWL_DistributionArrayMax) || 10;
let mode = process.env.MODE || "server";
let secret = process.env.SECRET || "THIS_IS_A_SECRET";
let pass = process.env.PASS || "THIS_IS_A_PASS";
let CRAWLER_PORT = parseInt(process.env.CRAWLER_PORT) || 3000
let CRAWL_asyncCount = parseInt(process.env.CRAWL_asyncCount) || 10

export default {
  env: env,
  protocol: protocol,
  host: host,
  port: port,
  endpoint: endpoint,
  DB_Server: DB_Server,
  DB_Name: DB_Name,
  CRAWL_HostInterval: CRAWL_HostInterval,
  CRAWL_minRange: CRAWL_minRange,
  CRAWL_maxRange: CRAWL_maxRange,
  ErrorCountTreshold: ErrorCountTreshold,
  MaxFileSizeInBytes: MaxFileSizeInBytes,
  CRAWL_DistributionArrayMax: CRAWL_DistributionArrayMax,
  APP_ID: APP_ID,
  LOG_LEVEL: LOG_LEVEL,
  OPENAPI_SPEC: OPENAPI_SPEC,
  secret: secret,
  pass: pass,
  mode: mode,
  CRAWLER_PORT: CRAWLER_PORT,
  CRAWL_asyncCount: CRAWL_asyncCount,
  CRAWL_API: CRAWL_API
};