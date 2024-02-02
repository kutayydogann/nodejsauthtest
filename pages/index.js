import Head from 'next/head';
import fetch from 'isomorphic-unfetch';
import useSWR from 'swr';
import Link from 'next/link';
import cookie from 'js-cookie';

function Home() {
  const { data, revalidate } = useSWR('/api/me', async function (args) {
    const res = await fetch(args);
    return res.json();
  });

  if (!data) return <h1>Yükleniyor...</h1>;

  let loggedIn = false;
  if (data.email) {
    loggedIn = true;
  }

  return (
    <div>
      <Head>
        <title>cargopanel</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <h1>cargopanel.co</h1>

      {loggedIn && (
        <>
          <p>Hoşgeldin {data.username || data.email}!</p>
          <button
            onClick={() => {
              cookie.remove('token');
              revalidate();
            }}>
            Çıkış Yap
          </button>
        </>
      )}
      {!loggedIn && (
        <>
          <Link href="/login">Giriş Yap</Link>
          <p>veya</p>
          <Link href="/signup">Kayıt Ol</Link>
        </>
      )}
    </div>
  );
}

export default Home;