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
        console.error(e);
      }
    }

    if (decoded) {
      // Veritabanından kullanıcı adını çek
      const client = new MongoClient('mongodb+srv://kutayydogann:81830311Kd@cargopanel.h8rlroc.mongodb.net/?retryWrites=true&w=majority');
      await client.connect();

      const db = client.db('cargopanel');
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ email: decoded.email });

      if (user) {
        res.json({ email: user.email, username: user.username });
      } else {
        res.status(404).json({});
      }

      await client.close();
      return;
    } else {
      res.status(401).json({ message: 'Unable to auth' });
    }
  }
};
