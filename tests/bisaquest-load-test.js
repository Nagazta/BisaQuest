import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, //change users to any number you like
    { duration: '30s', target: 100 }, //change users to any number you like
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const FRONTEND_URL = 'https://bisa-quest.vercel.app';
const API_URL = 'https://bisaquest-api.vercel.app';

export default function () {

  // ── Frontend ──
  const home = http.get(`${FRONTEND_URL}/`);
  check(home, { 'home page loads': (r) => r.status === 200 });
  sleep(1);

  // ── Create Player ──
  const createRes = http.post(
    `${API_URL}/api/player/create`,
    JSON.stringify({ nickname: `TestUser_${__VU}` }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /api/player/create' } }
  );

  check(createRes, {
    'create player status 201': (r) => r.status === 201,
    'create player returns id': (r) => JSON.parse(r.body)?.data?.player_id !== undefined,
  });

  const playerId = JSON.parse(createRes.body)?.data?.player_id;
  sleep(1);

  // ── Character Selection ──
  if (playerId) {
    const charRes = http.put(
      `${API_URL}/api/player/${playerId}/character`,
      JSON.stringify({ character: 'roberto' }), // simulating choosing 'roberto' or 'roberta'
      { headers: { 'Content-Type': 'application/json' }, tags: { name: 'PUT /api/player/:playerId/character' } }
    );

    check(charRes, {
      'update character status 200': (r) => r.status === 200,
    });

    sleep(1);
  }
}