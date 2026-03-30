// load-test-threshold.js
import http from 'k6/http';
import { sleep, check } from 'k6';

const BASE_URL = 'https://api.mcp-calendar.dev';
const TOKEN = __ENV.TOKEN;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
};

export const options = {
  stages: [
    { duration: '1m', target: 50  },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 150 },
    { duration: '1m', target: 200 },
    { duration: '1m', target: 250 },
    { duration: '1m', target: 300 },
    { duration: '2m', target: 300 },
    { duration: '1m', target: 0   },
  ],
};

export default function () {
  const eventsRes = http.get(
    `${BASE_URL}/api/events/monthly?year=2025&month=3`,
    { headers }
  );
  check(eventsRes, { 'events 200': (r) => r.status === 200 });
  sleep(0.5);

  const txRes = http.get(
    `${BASE_URL}/api/transactions/monthly?year=2025&month=3`,
    { headers }
  );
  check(txRes, { 'transactions 200': (r) => r.status === 200 });
  sleep(0.5);

  const summaryRes = http.get(
    `${BASE_URL}/api/transactions/summary?year=2025&month=3`,
    { headers }
  );
  check(summaryRes, { 'summary 200': (r) => r.status === 200 });
  sleep(0.5);
}