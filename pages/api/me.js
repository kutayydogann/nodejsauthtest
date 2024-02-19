import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

config();

const jwtSecret = process.env.JWT_SECRET;
const url = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB_NAME || 'cargopanel';

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!('token' in req.cookies)) {
      res.status(401).json({ message: 'Unable to auth' });
      return;
    }

    let decoded;
    const token = req.cookies.token;

    if (token) {
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (e) {
        res.status(401).json({ message: 'Unable to auth' });
        return;
      }
    }

    if (decoded) {
      // MongoDB bağlantısı
      const client = new MongoClient(url);

      try {
        await client.connect();

        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: decoded.email });

        if (user) {
          res.json({ email: user.email, firstName: user.firstName, lastName: user.lastName });
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
      } finally {
        if (client && typeof client.isConnected === 'function' && client.isConnected()) {
          await client.close();
        }
      }
      return;
    } else {
      res.status(401).json({ message: 'Unable to auth' });
    }
  }
};
