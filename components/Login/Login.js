import { useState, useRef } from 'react';
import { InputText, Password } from './Login.styles'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
;
import { useRouter } from 'next/router';

import {
  savePersonWS,
} from '../../services/register.service';
import {
  loginWS,
} from '../../services/login.service';
import { locale_ES } from 'util/date';

const Login = () => {

  addLocale('es', locale_ES);

  const emptyPerson = {
    dni: '',
    dniType: 0,
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    birthDate: '',
    gender: '',
    username: '',
    password: '',
  };

  const emptyUser = {
    username: '',
    password: '',
  };
  
  const documentList = [
    { label: 'Cédula', value: 1 },
    { label: 'Ruc', value: 2 },
    { label: 'Pasaporte', value: 3 },
  ];

  const genderList = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
  ];

  const [user, setUser] = useState(emptyUser);
  const [person, setPerson] = useState(emptyPerson);
  const [personDialog, setPersonDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toast = useRef();
  const router = useRouter();


  const hanlderLogin = async () => {
    setSubmitted(true);
    if (user.username.trim() && user.password.trim()) {
      try {
        const { data } = await loginWS(user);
        console.log(data.data.functionalities);
        localStorage.setItem('functionalities', JSON.stringify(data.data.functionalities));
        router.push('/home');
        toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Login', life: 5000 });
      } catch (error) {
        console.log(error?.response?.data?.error);
        const { title, message} = error?.response?.data?.error;
        return toast.current.show({ severity: 'error', summary: title, detail: message, life: 5000 });
      }   
    }
  }

  const hanlderRegister = () => {
    setPerson(emptyPerson);
    setSubmitted(false);
    setPersonDialog(true);
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _person = {...person};
    _person[`${name}`] = val;

    setPerson(_person);
  }

  const onUserInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _user = {...user};
    _user[`${name}`] = val;

    setUser(_user);
  }

  const savePerson = async () => {
    setSubmitted(true);
    if (person.dni.trim() && person.name.trim()) {
      setSubmitted(false);
      let _person = {...person};
      try {
        const { data } = await savePersonWS(_person);
        console.log(data);
        toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Usuario Creado exitosamente', life: 5000 });
        setPersonDialog(false);
      } catch (error) {
        return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al crear el usuario', life: 5000 });
      }
    }
    setPerson(emptyPerson);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setPersonDialog(false);
  }

  const onDniTypeChange = (e) => setPerson({ ...person, dniType: e.value });

  const onGenderChange = (e) => setPerson({ ...person, gender: e.value });

  const monthNavigatorTemplate = (e) => {
    return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1, marginRight: 5 }} />;
  }

  const yearNavigatorTemplate = (e) => {
    return <Dropdown value={e.value} options={e.options} filter onChange={(event) => e.onChange(event.originalEvent, event.value)} className="p-ml-2" style={{ lineHeight: 1 }} />;
  }

  const personDialogFooter = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-secondary"
        onClick={() => hideDialog()}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={() => savePerson()}
      />
    </>
  );

  return (
    <>
    <Toast ref={toast} />
    <div className="p-8">
      <div className="shadow-2 surface-card p-4 border-round flex flex-column justify-content-center">
        <div className="field">
          <label htmlFor="username">Usuario</label>
          <InputText
            id="username"
            required
            className={classNames({ 'p-invalid': submitted && !user.username })}
            value={user.username}
            onChange={(e) => onUserInputChange(e, 'username')}
          />
          {submitted && !user.username && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <Password
            id="password"
            toggleMask
            feedback={false}
            required
            className={classNames({ 'p-invalid': submitted && !user.password })}
            value={user.password}
            onChange={(e) => onUserInputChange(e, 'password')}
          />
          {submitted && !user.password && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
      <Button
        label='Ingresar'
        className='mt-3'
        onClick={hanlderLogin}
      />
      <Button
        label='Registrarse'
        className='p-button-secondary mt-3'
        onClick={hanlderRegister}
      />
      </div>

      <Dialog visible={personDialog} style={{ width: '550px' }} header="Detalles del usuario" modal className="p-fluid" footer={personDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="dniType">Tipo Identificación</label>
          <Dropdown
            id="dniType"
            value={person.dniType}
            options={documentList}
            optionLabel="label"
            optionValue="value"
            onChange={onDniTypeChange}
            className={classNames({ 'p-invalid': submitted && !person.dniType })}
          />
          {submitted && !person.dniType && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="dni">Identificación</label>
          <InputText
            id="dni"
            value={person.dni}
            required
            className={classNames({ 'p-invalid': submitted && !person.dni })}
            onChange={(e) => onInputChange(e, 'dni')}
          />
          {submitted && !person.dni && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="name">Nombres</label>
          <InputText
            id="name"
            value={person.name}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !person.name })}
            onChange={(e) => onInputChange(e, 'name')}
          />
          {submitted && !person.name && <p className="p-error text-sm">El nombre es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="surname">Apellidos</label>
          <InputText
            id="surname"
            value={person.surname}
            required
            className={classNames({ 'p-invalid': submitted && !person.surname })}
            onChange={(e) => onInputChange(e, 'surname')}
          />
          {submitted && !person.surname && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="gender">Género</label>
          <Dropdown
            id="gender"
            value={person.gender}
            options={genderList}
            onChange={onGenderChange}
            optionLabel="label"
            optionValue="value"
          />
          {submitted && !person.gender && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="birthDate">Fecha de nacimiento</label>
          <Calendar
            id="birthDate"
            value={new Date(person.birthDate)}
            onChange={({ value }) => setPerson({ ...person, birthDate: new Date(value).toISOString() })}
            showIcon
            locale="es"
            dateFormat="dd/mm/yy"
            monthNavigator
            yearNavigator
            yearRange="1950:2022"
            monthNavigatorTemplate={monthNavigatorTemplate}
            yearNavigatorTemplate={yearNavigatorTemplate}
            touchUI
            className={classNames({ 'p-invalid': submitted && !person.birthDate })}
          />
          {submitted && !person.birthDate && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="address">Dirección</label>
          <InputText
            id="address"
            value={person.address}
            required
            className={classNames({ 'p-invalid': submitted && !person.address })}
            onChange={(e) => onInputChange(e, 'address')}
          />
          {submitted && !person.address && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={person.email}
            required
            className={classNames({ 'p-invalid': submitted && !person.email })}
            onChange={(e) => onInputChange(e, 'email')}
          />
          {submitted && !person.email && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono</label>
          <InputText
            id="phone"
            value={person.phone}
            required
            className={classNames({ 'p-invalid': submitted && !person.phone })}
            onChange={(e) => onInputChange(e, 'phone')}
          />
          {submitted && !person.phone && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="city">Ciudad</label>
          <InputText
            id="city"
            value={person.city}
            required
            className={classNames({ 'p-invalid': submitted && !person.city })}
            onChange={(e) => onInputChange(e, 'city')}
          />
          {submitted && !person.city && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="username">Usurio</label>
          <InputText
            id="username"
            value={person.username}
            required
            className={classNames({ 'p-invalid': submitted && !person.username })}
            onChange={(e) => onInputChange(e, 'username')}
          />
          {submitted && !person.username && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="passwordNew">Contraseña</label>
          <Password
            id="passwordNew"
            value={person.password}
            required
            className={classNames({ 'p-invalid': submitted && !person.password })}
            onChange={(e) => onInputChange(e, 'password')}
            toggleMask
            feedback={false}
          />
          {submitted && !person.password && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
      </Dialog>
    </div>
    </>
  );
};

export default Login;