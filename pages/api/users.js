import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = 'SUPERSECRETE20220';

const url = 'mongodb+srv://kutayydogann:81830311Kd@cargopanel.h8rlroc.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cargopanel';

let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(url);
    await client.connect();
  }
  return client.db(dbName);
}

function findUser(collection, email) {
  return collection.findOne({ email });
}

async function createUser(collection, email, password, username, companyname, phone) {
  const hash = await bcrypt.hash(password, saltRounds);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'long',
    timeStyle: 'long',
  });

  try {
    const result = await collection.insertOne({
      userId: uuidv4(),
      email,
      password: hash,
      username,
      companyname,
      phone,
      registrationDate: formattedDate,
      lastLoginDate: null,
    });

    if (result && result.insertedId) {
      const insertedUser = await collection.findOne({ _id: result.insertedId });
      return insertedUser;
    }

    throw new Error('Hesap oluşturma başarısız!');
  } catch (error) {
    console.error('Hesap oluşturulurken beklenmeyen hata:', error);
    throw new Error('Hesap oluşturma başarısız!');
  }
}

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      if (!req.body.email || !req.body.password || !req.body.username || !req.body.companyname || !req.body.phone) {
        throw new Error('Tüm alanlar gereklidir!');
      }

      const db = await connectToDatabase();
      const collection = db.collection('users');
      const email = req.body.email;

      const user = await findUser(collection, email);

      if (!user) {
        const createdUser = await createUser(collection, req.body.email, req.body.password, req.body.username, req.body.companyname, req.body.phone);

        const token = jwt.sign(
          { userId: createdUser.userId, email: createdUser.email, username: createdUser.username, companyname: createdUser.companyname, phone: createdUser.phone },
          jwtSecret,
          { expiresIn: 3600 },
        );

        res.status(200).json({ token });
      } else {
        res.status(403).json({ error: true, message: 'Bu e-posta kayıtlıdır!' });
      }
    } catch (error) {
      console.error('Kayıt sırasında hata oluştu:', error);
      res.status(500).json({ error: true, message: 'Hesap oluşturma başarısız!' });
    }
  } else {
    res.status(200).json({ users: ['Kutay Doğan'] });
  }
};
