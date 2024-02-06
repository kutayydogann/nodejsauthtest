const jwt = require('jsonwebtoken');
const jwtSecret = 'SUPERSECRETE20220';
const { MongoClient } = require('mongodb');

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
      const client = new MongoClient('mongodb+srv://kutayydogann:81830311Kd@cargopanel.h8rlroc.mongodb.net/?retryWrites=true&w=majority');

      try {
        await client.connect();

        const db = client.db('cargopanel');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: decoded.email });

        if (user) {
          res.json({ email: user.email, username: user.username });
        } else {
          res.status(404).json({});
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: true, message: 'Internal Server Error' });
      } finally {
        await client.close();
      }
      return;
    } else {
      res.status(401).json({ message: 'Unable to auth' });
    }
  }
};
