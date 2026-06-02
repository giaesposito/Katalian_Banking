import { readFileSync } from 'fs';
import { join } from 'path';

export interface Credential {
  username: string;
  password: string;
  status: 'Active' | 'Locked';
  notes: string;
}

function parseCSV(filePath: string): Credential[] {
  const lines = readFileSync(filePath, 'utf-8').trim().split('\n');
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const [username, password, status, ...noteParts] = line.split(',');
      return {
        username: username.trim(),
        password: password.trim(),
        status: status.trim() as Credential['status'],
        notes: noteParts.join(',').trim(),
      };
    });
}

export const credentials = parseCSV(join(__dirname, '../fixtures/credentials.csv'));
export const activeCredentials = credentials.filter(c => c.status === 'Active');
export const lockedCredentials = credentials.filter(c => c.status === 'Locked');
