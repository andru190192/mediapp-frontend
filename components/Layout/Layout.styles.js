import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #ECECF9;
`;

export const Navbar = styled.nav`
  position: fixed;
  overflow: auto;
  z-index: 1001;
  box-shadow: 0 2px 4px 0px rgb(0 0 0 / 30%);
  width: 200px;
  height: 100vh;
  min-height: 100%;
  background: linear-gradient(180deg, #F6F9FC 0%, #ECECF9 100%);
  background-repeat: no-repeat;
  background-attachment: fixed;
`;

export const Main = styled.main`
  width: 100%;
  padding: 1rem 1rem 1rem 216px;
`;