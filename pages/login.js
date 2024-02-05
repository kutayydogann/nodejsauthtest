import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import cookie from 'js-cookie';

const Login = () => {
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const token = cookie.get('token');
    if (token) {
      // Kullanıcı zaten giriş yapmışsa anasayfaya yönlendir
      Router.push('/');
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Call API
    fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.error) {
          setLoginError(data.message);
        }
        if (data && data.token) {
          // Set cookie
          cookie.set('token', data.token, { expires: 2 });
          Router.push('/');
        }
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Giriş Yap</h3>
      <input
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-Posta"
      />
      <input
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre"
      />
      <input type="submit" value="Giriş Yap" />
      {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
    </form>
  );
};

export default Login;
