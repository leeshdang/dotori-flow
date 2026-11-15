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

import nodemailer from 'nodemailer';
import { INITIAL_FIELDS, INITIAL_ISSUES } from '../src/constants/initialData.js';
import { buildIssuesXlsContent } from '../src/utils/excelExport.js';
import { getRedisConfig, redisCommand } from './_lib/redis.js';
import { loadFields } from './fields.js';

const ISSUES_HASH_KEY = 'dotori_flow:issues_map';
const DEFAULT_BACKUP_EMAIL = 'leeshdang@gmail.com';

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
  return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

async function sendViaGmail({ to, subject, text, filename, fileBuffer }) {
  const user = process.env.GMAIL_USER || DEFAULT_BACKUP_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    return { sent: false, reason: 'NO_GMAIL_APP_PASSWORD' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Dotori Flow Backup" <${user}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        content: fileBuffer,
        contentType: 'application/vnd.ms-excel',
      },
    ],
  });

  return { sent: true, provider: 'gmail' };
}

async function sendViaResend({ to, subject, text, filename, fileBuffer }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'NO_RESEND_API_KEY' };
  }

  const from = process.env.RESEND_FROM || 'Dotori Flow Backup <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      attachments: [
        {
          filename,
          content: fileBuffer.toString('base64'),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errText}`);
  }

  return { sent: true, provider: 'resend' };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Optional CRON_SECRET verification when invoked via GET
  if (req.method === 'GET' && process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization || '';
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    let issues = INITIAL_ISSUES;
    let fields = INITIAL_FIELDS;

    if (getRedisConfig()) {
      fields = await loadFields();
      const rawMap = await redisCommand('HGETALL', ISSUES_HASH_KEY);
      const parsed = parseIssueMap(rawMap);
      if (parsed.length > 0) {
        issues = parsed;
      }
    }

    const kstDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const filename = `Dotori_Flow_Backup_${kstDate}.xls`;
    const xlsContent = buildIssuesXlsContent(issues, fields);
    const fileBuffer = Buffer.from('\uFEFF' + xlsContent, 'utf8');

    const to = process.env.BACKUP_EMAIL_TO || DEFAULT_BACKUP_EMAIL;
    const subject = `[Dotori Flow] 일일 티켓 백업 (${kstDate} · 총 ${issues.length}건)`;
    const text =
      `안녕하세요,\n\n` +
      `Dotori Flow 일일 자동 백업 파일(${filename})을 첨부합니다.\n` +
      `- 기준 일자: ${kstDate} (KST)\n` +
      `- 총 티켓 수: ${issues.length}건\n` +
      `- 포함 시트: 전체 티켓, 수정 내역 로그, 필드 설정\n\n` +
      `감사합니다.\nDotori Flow`;

    let result = await sendViaGmail({ to, subject, text, filename, fileBuffer });
    if (!result.sent) {
      result = await sendViaResend({ to, subject, text, filename, fileBuffer });
    }

    if (!result.sent) {
      return res.status(400).json({
        ok: false,
        error: '이메일 발송 설정(GMAIL_APP_PASSWORD 또는 RESEND_API_KEY)이 Vercel 환경변수에 등록되어 있지 않습니다.',
        issueCount: issues.length,
        filename,
      });
    }

    return res.status(200).json({
      ok: true,
      provider: result.provider,
      to,
      filename,
      issueCount: issues.length,
      date: kstDate,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Backup failed' });
  }
}
