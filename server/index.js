import express from 'express';
import cors from 'cors';
import { PrismaClient, ExpenseStatus } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, inviteCode } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    const code = inviteCode ?? `ROOM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const existing = await prisma.room.findFirst({ where: { inviteCode: code } });
    if (existing) return res.status(400).json({ error: 'Invite code already exists' });

    const room = await prisma.room.create({
      data: { name, inviteCode: code },
    });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.roomId },
      include: { roommates: true },
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

app.get('/api/rooms/:roomId/roommates', async (req, res) => {
  try {
    const roommates = await prisma.roommate.findMany({
      where: { roomId: req.params.roomId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(roommates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch roommates' });
  }
});

app.post('/api/roommates', async (req, res) => {
  try {
    const { name, email, password, roomId, isManager } = req.body;
    if (!name || !email || !password || !roomId) {
      return res.status(400).json({ error: 'name, email, password, and roomId are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailExists = await prisma.roommate.findFirst({
      where: { email: normalizedEmail },
    });
    if (emailExists) return res.status(400).json({ error: 'Email already exists' });

    const managerExists = await prisma.roommate.findFirst({
      where: { roomId },
    });

    const roommate = await prisma.roommate.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password,
        isManager: managerExists ? Boolean(isManager) : true,
        roomId,
      },
    });
    res.json(roommate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create roommate' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const normalizedEmail = email.trim().toLowerCase();
    const roommate = await prisma.roommate.findFirst({
      where: { email: normalizedEmail },
      include: { room: true },
    });
    if (!roommate || roommate.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(roommate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

app.get('/api/rooms/:roomId/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { roomId: req.params.roomId },
      include: {
        addedBy: true,
        approvedBy: true,
      },
      orderBy: { date: 'desc' },
    });
    const shaped = expenses.map(expense => ({
      ...expense,
      addedByName: expense.addedBy?.name,
      approvedByName: expense.approvedBy?.name,
    }));
    res.json(shaped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/rooms/:roomId/expenses', async (req, res) => {
  try {
    const { description, amount, category, date, addedById } = req.body;
    if (!description || !amount || !category || !date || !addedById) {
      return res.status(400).json({ error: 'description, amount, category, date, addedById required' });
    }

    const expense = await prisma.expense.create({
      data: {
        description: description.trim(),
        amount: Number(amount),
        category,
        date: new Date(date),
        roomId: req.params.roomId,
        addedById,
      },
    });
    const withNames = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: { addedBy: true },
    });
    res.json({
      ...expense,
      addedByName: withNames?.addedBy?.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.post('/api/expenses/:expenseId/status', async (req, res) => {
  try {
    const { status, approverId } = req.body;
    if (!status || !Object.values(ExpenseStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const expense = await prisma.expense.update({
      where: { id: req.params.expenseId },
      data: {
        status,
        approvedById: approverId ?? null,
        approvedAt: status === 'pending' ? null : new Date(),
      },
    });
    const withNames = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: { addedBy: true, approvedBy: true },
    });
    res.json({
      ...expense,
      addedByName: withNames?.addedBy?.name,
      approvedByName: withNames?.approvedBy?.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update expense status' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
