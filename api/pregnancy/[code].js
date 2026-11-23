import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (!uri) {
    throw new Error('Falta configurar MONGODB_URI en las variables de entorno');
  }

  if (cachedDb) {
    return cachedDb;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const db = cachedClient.db('control_embarazo');
  cachedDb = db;
  return db;
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawCode = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code;
  const familyCode = String(rawCode || '').toUpperCase().trim();

  if (!familyCode) {
    return res.status(400).json({ error: 'Código familiar inválido' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('spaces');

    if (req.method === 'GET') {
      const doc = await collection.findOne({ familyCode });
      if (!doc) {
        return res.status(200).json({
          familyCode,
          pregnancy: { fum: '', babyName: 'Bebé' },
          appointments: [],
          studies: [],
          notes: [],
          reminders: []
        });
      }

      const { _id, ...cleanDoc } = doc;
      return res.status(200).json(cleanDoc);
    }

    if (req.method === 'PUT') {
      const body = parseBody(req);

      const payload = {
        familyCode,
        pregnancy: body.pregnancy || { fum: '', babyName: 'Bebé' },
        appointments: Array.isArray(body.appointments) ? body.appointments : [],
        studies: Array.isArray(body.studies) ? body.studies : [],
        notes: Array.isArray(body.notes) ? body.notes : [],
        reminders: Array.isArray(body.reminders) ? body.reminders : [],
        updatedAt: new Date().toISOString()
      };

      await collection.updateOne(
        { familyCode },
        { $set: payload },
        { upsert: true }
      );

      return res.status(200).json(payload);
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/pregnancy/[code]:', error);
    return res.status(500).json({
      error: 'Error interno al conectar con MongoDB',
      details: error.message
    });
  }
}
