/**
 * Copyright 2026 Dotori Tools
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { INITIAL_FIELDS } from '../src/constants/initialData.js';
import { getRedisConfig, redisCommand, readJsonBody } from './_lib/redis.js';

const FIELDS_KEY = 'dotori_flow:fields';

export async function loadFields() {
  const raw = await redisCommand('GET', FIELDS_KEY);
  if (raw) {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  await redisCommand('SET', FIELDS_KEY, JSON.stringify(INITIAL_FIELDS));
  return INITIAL_FIELDS;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!getRedisConfig()) {
    return res.status(200).json({
      storageConfigured: false,
      fields: null,
    });
  }

  try {
    if (req.method === 'GET') {
      const fields = await loadFields();
      return res.status(200).json({ storageConfigured: true, fields });
    }

    if (req.method === 'PUT') {
      const body = await readJsonBody(req);
      if (!Array.isArray(body.fields)) {
        return res.status(400).json({ error: 'Invalid fields payload' });
      }
      await redisCommand('SET', FIELDS_KEY, JSON.stringify(body.fields));
      return res.status(200).json({ storageConfigured: true, fields: body.fields });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
