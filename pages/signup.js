import React, { useState } from 'react';
import Router from 'next/router';
import cookie from 'js-cookie';

const Signup = () => {
  const [signupError, setSignupError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        firstName,
        lastName,
        companyName,
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
      <label htmlFor="firstName">Ad</label>
      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        name="firstName"
        type="text"
        required
      />

      <label htmlFor="lastName">Soyad</label>
      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        name="lastName"
        type="text"
        required
      />

      <label htmlFor="companyName">Şirket Adı (Opsiyonel)</label>
      <input
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        name="companyName"
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
