import { Container, Navbar, Main } from './Layout.styles'
import Link from 'next/link'

const Layout = ({ children }) => {
  return (
    <Container>
      <Navbar>
        <ul>
          <li>
            <Link href="/home">
              <a>Inicio</a>
            </Link>
          </li>
          <li>
            <Link href="/specialties">
              <a>Especialidades</a>
            </Link>
          </li>
          <li>
            <Link href="/doctors">
              <a>Médicos</a>
            </Link>
          </li>
          <li>
            <Link href="/">
              <a>Salir</a>
            </Link>
          </li>
        </ul>
      </Navbar>
      <Main>
        { children }
      </Main>
    </Container>
  );
};

export default Layout;