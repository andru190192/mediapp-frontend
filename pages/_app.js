import "primereact/resources/themes/lara-light-indigo/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css"; 
import "primeflex/primeflex.css"
import '../styles/globals.css'
import Layout from '../components/Layout'

function MyApp({ Component, pageProps }) {
  switch (Component.name) {
    case 'Login':
      return <Component {...pageProps} />;
    default:
      return (
        <Layout>
          <Component {...pageProps} />{" "}
        </Layout>
      );
  }
}

export default MyApp
