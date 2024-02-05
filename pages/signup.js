import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import cookie from 'js-cookie';

const Signup = () => {
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [companyname, setCompanyname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa anasayfaya yönlendir
    const token = cookie.get('token');
    if (token) {
      Router.push('/');
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setSignupError('');
    setLoading(true);

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        companyname,
        phone,
        email,
        password,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setLoading(false);

        if (data && data.error) {
          setSignupError(data.message);
        }
        if (data && data.token) {
          cookie.set('token', data.token, { expires: 2 });
          Router.push('/');
        }
      })
      .catch((error) => {
        setLoading(false);
        setSignupError('Bir hata oluştu. Lütfen tekrar deneyin.');
        console.error('Fetch hatası:', error);
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Hesap Oluştur</h3>
      <label htmlFor="username">Ad Soyad</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        name="username"
        type="text"
        required
      />

      <label htmlFor="companyname">Şirket Adı (Opsiyonel)</label>
      <input
        value={companyname}
        onChange={(e) => setCompanyname(e.target.value)}
        name="companyname"
        type="text"
      />

      <label htmlFor="phone">Telefon Numarası</label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        name="phone"
        type="tel"
        required
      />

      <label htmlFor="email">E-Posta</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        name="email"
        type="email"
        required
      />

      <label htmlFor="password">Şifre</label>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        name="password"
        type="password"
        required
      />

      <br /><br />

      <input type="submit" value="Kayıt Ol" disabled={loading} />
      {loading && <p>Yükleniyor...</p>}
      {signupError && <p style={{ color: 'red' }}>{signupError}</p>}
    </form>
  );
};

export default Signup;
