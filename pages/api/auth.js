import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const jwtSecret = 'SUPERSECRETE20220';

const saltRounds = 10;
const url = 'mongodb+srv://kutayydogann:81830311Kd@cargopanel.h8rlroc.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cargopanel';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function findUser(db, email) {
  const collection = db.collection('users');
  return collection.findOne({ email });
}

function authUser(db, email, password, hash, callback) {
  const collection = db.collection('users');
  bcrypt.compare(password, hash, callback);
}

export default (req, res) => {
  if (req.method === 'POST') {
    // Giriş yapma
    try {
      if (!req.body.email) throw new Error('E-Posta girilmesi zorunludur');
      if (!req.body.password) throw new Error('Şifre girilmesi zorunludur');
    } catch (bodyError) {
      res.status(403).json({ error: true, message: bodyError.message });
      return;
    }

    client.connect(async function (err) {
      if (err) {
        console.error('Error connecting to MongoDB server:', err);
        res.status(500).json({ error: true, message: 'MongoDB sunucusuna bağlanırken hata oluştu' });
        return;
      }

      console.log('Connected to MongoDB server =>');
      const db = client.db(dbName);
      const email = req.body.email;
      const password = req.body.password;

      try {
        const user = await findUser(db, email);

        if (!user) {
          res.status(404).json({ error: true, message: 'Kullanıcı bulunamadı' });
          return;
        }

        authUser(db, email, password, user.password, function (err, match) {
          if (err) {
            res.status(500).json({ error: true, message: 'Kimlik doğrulama başarısız oldu' });
            return;
          }

          if (match) {
            const token = jwt.sign(
              { userId: user.userId, email: user.email },
              jwtSecret,
              {
                expiresIn: 3600, // 60 dakika
              },
            );
            res.status(200).json({ token });
            return;
          } else {
            res.status(401).json({ error: true, message: 'Kimlik doğrulama başarısız oldu' });
            return;
          }
        });
      } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: true, message: 'Kullanıcı bulma hatası' });
      } finally {
        await client.close();
      }
    });
  } else {
    // Diğer HTTP metodlarına yanıt verme
    res.status(401).end();
  }
};
