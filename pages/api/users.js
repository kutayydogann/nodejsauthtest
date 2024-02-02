import { MongoClient } from 'mongodb';
import assert from 'assert';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = 'SUPERSECRETE20220';

const url = 'mongodb+srv://kutayydogann:81830311Kd@cargopanel.h8rlroc.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'cargopanel';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function findUser(db, email, callback) {
  const collection = db.collection('users');
  collection.findOne({ email }, callback);
}

function createUser(db, email, password, username, companyname, phone, callback) {
  const collection = db.collection('users');
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      callback(err, null);
      return;
    }
    // Store hash in your password DB.
    collection.insertOne(
      {
        userId: uuidv4(),
        email,
        password: hash,
        username,
        companyname,
        phone,
      },
      function (err, userCreated) {
        assert.equal(err, null);
        callback(null, userCreated);
      },
    );
  });
}

export default (req, res) => {
  if (req.method === 'POST') {
    // signup
    try {
      assert.notEqual(null, req.body.email, 'Email required');
      assert.notEqual(null, req.body.password, 'Password required');
      assert.notEqual(null, req.body.username, 'Username required');
      assert.notEqual(null, req.body.companyname, 'Companyname required');
      assert.notEqual(null, req.body.phone, 'Phone required');
    } catch (bodyError) {
      res.status(403).json({ error: true, message: bodyError.message });
      return;
    }

    // verify email does not exist already
    client.connect(function (err) {
      if (err) {
        res.status(500).json({ error: true, message: 'Error connecting to MongoDB' });
        return;
      }
      console.log('Connected to MongoDB server =>');
      const db = client.db(dbName);
      const email = req.body.email;
      const password = req.body.password;
      const username = req.body.username;
      const companyname = req.body.companyname;
      const phone = req.body.phone;

      findUser(db, email, function (err, user) {
        if (err) {
          res.status(500).json({ error: true, message: 'Error finding User' });
          return;
        }
        if (!user) {
          // proceed to Create
          createUser(db, email, password, username, companyname, phone, function (err, creationResult) {
            if (err) {
              res.status(500).json({ error: true, message: 'Error creating User' });
              return;
            }
            if (creationResult.ops.length === 1) {
              const user = creationResult.ops[0];
              const token = jwt.sign(
                { userId: user.userId, email: user.email, username, companyname, phone },
                jwtSecret,
                {
                  expiresIn: 3000, // 50 minutes
                },
              );
              res.status(200).json({ token });
              return;
            }
          });
        } else {
          // User exists
          res.status(403).json({ error: true, message: 'Email exists' });
          return;
        }
      });
    });
  } else {
    // Handle any other HTTP method
    res.status(200).json({ users: ['Kutay Doğan'] });
  }
};
