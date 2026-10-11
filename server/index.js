import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data', 'store.json');
const secret = process.env.SESSION_SECRET || 'foodconnect-demo-local-secret';
const port = Number(process.env.PORT || 5000);

function loadStore() {
  if (fs.existsSync(dataPath)) return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  const users = [
    ['supplier@foodconnect.demo', 'Demo Supplier', 'supplier', 'org-1'],
    ['receiver@foodconnect.demo', 'Demo Receiver', 'receiver', 'org-4'],
    ['admin@foodconnect.demo', 'Demo Admin', 'admin', null],
  ].map(([email, name, role, organizationId]) => ({ id: crypto.randomUUID(), email, name, role, organizationId, passwordHash: bcrypt.hashSync('demo123', 12) }));
  const store = { users, organizations: [], audit: [] };
  fs.writeFileSync(dataPath, JSON.stringify(store, null, 2));
  return store;
}

let store = loadStore();
const save = () => fs.writeFileSync(dataPath, JSON.stringify(store, null, 2));
const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organizationId });
const issueToken = (user) => jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: '8h' });

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });
  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
}

const app = express();
app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, organizationName, organizationType, address, role } = req.body || {};
  if (!name || !email || !password || !organizationName || !organizationType || !address || !['supplier', 'receiver'].includes(role)) return res.status(400).json({ error: 'Name, email, password, organization details, address, and account type are required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  if (store.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ error: 'An account already exists for this email.' });
  const organization = { id: crypto.randomUUID(), name: organizationName, type: organizationType, address, role, verification: 'pending' };
  const user = { id: crypto.randomUUID(), name, email: email.toLowerCase(), role, organizationId: organization.id, passwordHash: await bcrypt.hash(password, 12) };
  store.users.push(user);
  store.organizations.push(organization);
  store.audit.unshift({ id: crypto.randomUUID(), message: `${organizationName} registered with pending verification.`, at: new Date().toISOString() });
  save();
  return res.status(201).json({ token: issueToken(user), user: publicUser(user), organization });
});
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = store.users.find((item) => item.email === String(email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password.' });
  return res.json({ token: issueToken(user), user: publicUser(user) });
});
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body || {};
  if (!email || !newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Email and a new password of at least 8 characters are required.' });
  const user = store.users.find((item) => item.email === String(email).toLowerCase());
  if (!user) return res.status(404).json({ error: 'No account was found for this email.' });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  store.audit.unshift({ id: crypto.randomUUID(), message: `Password reset completed for ${user.email}.`, at: new Date().toISOString() });
  save();
  return res.json({ message: 'Password reset completed. You can now log in.' });
});
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = store.users.find((item) => item.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  return res.json({ user: publicUser(user) });
});
app.post('/api/auth/logout', requireAuth, (_req, res) => res.status(204).end());

app.listen(port, () => console.log(`FoodConnect API listening on http://127.0.0.1:${port}`));
