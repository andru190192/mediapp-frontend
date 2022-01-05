import { useRef } from 'react';
import { InputText, Password } from './Login.styles'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/router';


const Login = () => {

  const toast = useRef();
  const router = useRouter();

  const hanlderLogin = () => {
    router.push('/home');
    toast.current.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Usuario o contraseña invalida',
      closable: false
    });
  }

  return (
    <div className="p-8">
      <div className="shadow-2 surface-card p-4 border-round flex flex-column justify-content-center">
        <label htmlFor="username">Usuario</label>
        <InputText id="username" />
      
        <label htmlFor="password">Contraseña</label>
        <Password
          id="password"
          toggleMask
          feedback={false}
        />
      <Button
        label='Ingresar'
        className='mt-3'
        onClick={hanlderLogin}
      />
      </div>
      <Toast ref={toast} />
    </div>
  );
};

export default Login;