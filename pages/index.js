import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import cookie from 'js-cookie';

function Home() {
  const { data, mutate } = useSWR('/api/me', async function (args) {
    const res = await fetch(args);
    return res.json();
  });

  if (!data) return <h1>Yükleniyor...</h1>;

  const loggedIn = !!data.email;

  const handleLogout = () => {
    cookie.remove('token');
    mutate();
  };

  return (
    <div>
      <Head>
        <title>cargopanel</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <h1>cargopanel.co</h1>

      {loggedIn && (
        <>
          <p>Hoşgeldin {`${data.firstName} ${data.lastName}`}!</p>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </>
      )}
      {!loggedIn && (
        <>
          <Link href="/login">Giriş Yap</Link>
          <span> veya </span>
          <Link href="/signup">Kayıt Ol</Link>
        </>
      )}
    </div>
  );
}

export default Home;