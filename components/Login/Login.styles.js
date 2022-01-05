import styled, { css } from 'styled-components';
import { InputText as InputTextPrime } from 'primereact/inputtext'
import { Password as PasswordPrime } from 'primereact/password';

export const Label = styled.label`
  width: 100%;
`;

const myCSS = css`
  margin-button: 1rem;
`;

export const InputText = styled(InputTextPrime)`
  width: 100%;
  margin: 20px 0;
`;

export const Password = styled(PasswordPrime)`
  .p-inputtext {
    width: 100%;
  }
  width: 100%;
  margin: 20px 0;
`;