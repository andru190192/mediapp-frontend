import { useEffect, useState } from 'react';
import { Container, Navbar, Main } from './Layout.styles'
import Link from 'next/link'

const Layout = ({ children }) => {

  const [functionalities, setFunctionalities] = useState([]);

  useEffect(() => {
    const functionalities = JSON.parse(localStorage.getItem("functionalities"));
    setFunctionalities(functionalities);
    console.log('functionalities', functionalities);
  }, []);

  const onHandlerLogout = () => {
    localStorage.clear();
  }

  return (
    <Container>
      <Navbar>
        <ul>
          {functionalities?.map(functionality => (
            <li>
              <Link href={functionality.url}>
                <a>{functionality.name}</a>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/">
              <a onClick={onHandlerLogout}>Salir</a>
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