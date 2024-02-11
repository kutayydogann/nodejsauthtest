import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const jwtSecret = 'SUPERSECRETE20220';
const saltRounds = 10;
const url = 'mongodb+srv://kutayydogann:81830311Kd@cargopanel.h8rlroc.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cargopanel';

const client = new MongoClient(url);

function findUser(db, email) {
  const collection = db.collection('users');
  return collection.findOne({ email });
}

async function authUser(db, email, password, user) {
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    // Kullanıcının giriş yaptığı tarih ve zamanı alıyoruz
    const currentLoginDate = new Date();

    const formattedLoginDate = currentLoginDate.toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      dateStyle: 'long',
      timeStyle: 'long',
    });

    // Kullanıcının bilgilerini güncelliyoruz
    await db.collection('users').updateOne(
      { email: email },
      { $set: { lastLoginDate: formattedLoginDate } }
    );

    return true;
  }

  return false;
}

export default async (req, res) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(403).json({ error: true, message: 'E-Posta ve şifre girilmesi zorunludur!' });
      return;
    }

    try {
      await client.connect();
      console.log('Connected to MongoDB server =>');
      const db = client.db(dbName);

      const user = await findUser(db, email);

      if (!user) {
        res.status(404).json({ error: true, message: 'Kullanıcı bulunamadı' });
        return;
      }

      const authenticationResult = await authUser(db, email, password, user);

      if (authenticationResult) {
        const token = jwt.sign(
          { userId: user.userId, email: user.email },
          jwtSecret,
          {
            expiresIn: 3600, // 60 Dakika
          },
        );
        res.status(200).json({ token });
        return;
      } else {
        res.status(401).json({ error: true, message: 'E-posta veya şifre hatalı' });
        return;
      }
    } catch (err) {
      res.status(500).json({ error: true, message: 'Server Error' });
    } finally {
      await client.close();
    }
  } else {
    res.status(401).end();
  }
};
