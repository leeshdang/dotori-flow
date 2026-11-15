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

import { INITIAL_ISSUES } from '../src/constants/initialData.js';
import {
  buildIssueChangeLogs,
  canUserEditIssue,
  formatActorLabel,
} from '../src/utils/issuePermissions.js';
import { getRedisConfig, redisCommand, readJsonBody } from './_lib/redis.js';
import { loadFields } from './fields.js';

const ISSUES_HASH_KEY = 'dotori_flow:issues_map';
const ISSUE_SEQ_KEY = 'dotori_flow:issue_seq';
const SEEDED_KEY = 'dotori_flow:seeded';

async function ensureSeeded() {
  const seeded = await redisCommand('GET', SEEDED_KEY);
  if (seeded) return;

  for (const issue of INITIAL_ISSUES) {
    await redisCommand('HSET', ISSUES_HASH_KEY, issue.id, JSON.stringify(issue));
  }
  await redisCommand('SETNX', ISSUE_SEQ_KEY, '103');
  await redisCommand('SET', SEEDED_KEY, '1');
}

function parseIssueMap(flatList) {
  if (!Array.isArray(flatList)) return [];
  const list = [];
  for (let i = 0; i < flatList.length; i += 2) {
    const rawVal = flatList[i + 1];
    if (!rawVal) continue;
    try {
      const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
      list.push(parsed);
    } catch {
      // skip malformed entry
    }
  }
  return list.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!getRedisConfig()) {
    return res.status(200).json({
      storageConfigured: false,
      issues: null,
    });
  }

  try {
    await ensureSeeded();

    if (req.method === 'GET') {
      const rawMap = await redisCommand('HGETALL', ISSUES_HASH_KEY);
      const issues = parseIssueMap(rawMap);
      return res.status(200).json({ storageConfigured: true, issues });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const issueData = body.issueData || {};
      const currentUser = body.currentUser || null;

      const seq = await redisCommand('INCR', ISSUE_SEQ_KEY);
      const newId = `FLOW-${seq}`;
      const now = new Date().toISOString();
      const reporterName = currentUser
        ? currentUser.name || currentUser.email
        : (issueData.requesterEmail || '익명 사용자');

      const newIssue = {
        ...issueData,
        id: newId,
        status: 'todo',
        assignee: issueData.assignee || '미지정',
        reporter: reporterName,
        reporterEmail: currentUser?.email || issueData.requesterEmail || '',
        createdAt: now,
        updatedAt: now,
        history: [
          {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: now,
            actor: formatActorLabel(currentUser || { name: reporterName }),
            changes: [
              {
                fieldId: 'created',
                fieldLabel: '이슈 생성',
                from: '',
                to: newId,
                summaryText: `새 버그 리포트 [${newId}] 생성`,
              },
            ],
          },
        ],
      };

      await redisCommand('HSET', ISSUES_HASH_KEY, newId, JSON.stringify(newIssue));
      return res.status(201).json({ storageConfigured: true, issue: newIssue });
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      const { id, updates = {}, currentUser = null } = body;
      if (!id) {
        return res.status(400).json({ error: 'Missing issue id' });
      }

      const existingRaw = await redisCommand('HGET', ISSUES_HASH_KEY, id);
      if (!existingRaw) {
        return res.status(404).json({ error: `Issue ${id} not found` });
      }

      const targetIssue = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
      const hasFullPermission = canUserEditIssue(targetIssue, currentUser);
      let allowedUpdates = updates;

      if (!hasFullPermission) {
        if (!('assignee' in updates) || updates.assignee === targetIssue.assignee) {
          return res.status(403).json({
            error: '티켓 수정 권한이 없습니다. 먼저 담당자(Assignee)를 본인으로 변경한 후 다른 내용을 수정해 주세요.',
          });
        }
        allowedUpdates = { assignee: updates.assignee };
      }

      const fields = await loadFields();
      const changes = buildIssueChangeLogs(targetIssue, allowedUpdates, fields);
      if (changes.length === 0) {
        return res.status(200).json({ storageConfigured: true, issue: targetIssue });
      }

      const timestamp = new Date().toISOString();
      const nextHistory = [
        ...(Array.isArray(targetIssue.history) ? targetIssue.history : []),
        {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp,
          actor: formatActorLabel(currentUser),
          changes,
        },
      ];

      const updatedIssue = {
        ...targetIssue,
        ...allowedUpdates,
        updatedAt: timestamp,
        history: nextHistory,
      };

      await redisCommand('HSET', ISSUES_HASH_KEY, id, JSON.stringify(updatedIssue));
      return res.status(200).json({ storageConfigured: true, issue: updatedIssue, hasFullPermission });
    }

    if (req.method === 'DELETE') {
      const body = await readJsonBody(req);
      const id = body.id || req.query?.id;
      if (!id) {
        return res.status(400).json({ error: 'Missing issue id' });
      }
      await redisCommand('HDEL', ISSUES_HASH_KEY, id);
      return res.status(200).json({ storageConfigured: true, deletedId: id });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
