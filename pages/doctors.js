import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

import {
  getSpecialtiesWS,
} from '../services/specialty.service';
import {
  getDoctorsWS,
  saveDoctorWS,
  updateDoctorWS,
  deleteDoctorWS,
} from '../services/doctor.service';
import { locale_ES } from '../util/date';

export default function doctors() {

  addLocale('es', locale_ES);

  const emptyDoctor = {
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
    specialties: [],
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

  const [doctor, setDoctor] = useState(emptyDoctor);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [doctorDialog, setDoctorDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const toast = useRef();

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    const { data } = await getDoctorsWS();
    setDoctors(data);
  }

  const fetchSpecialties = async () => {
    const { data } = await getSpecialtiesWS();
    setSpecialties(data);
  }

  const editDoctor = (doctor) => {
    setDoctor({...doctor});
    setDoctorDialog(true);
  }

  const openNew = () => {
    setDoctor(emptyDoctor);
    setSubmitted(false);
    setDoctorDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setDoctorDialog(false);
    setDoctorDialog(false);
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _doctor = {...doctor};
    _doctor[`${name}`] = val;

    setDoctor(_doctor);
  }

  const saveDoctor = async () => {
    setSubmitted(true);

    if (doctor.dni.trim() && doctor.name.trim()) {
      setSubmitted(false);
      let _doctor = {...doctor};
      if (doctor.id) {
        try {
          const { data: doctorResponse } = await updateDoctorWS(_doctor);
          setDoctors(doctors.map((val) => (val.id === doctor.id) ? val = doctorResponse : val))
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Doctor Actualizado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al actualizar el médico', life: 5000 });
        }
        
      } else {
        try {
          const { data: doctorResponse } = await saveDoctorWS(_doctor);
          setDoctors([...doctors, doctorResponse]);
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Doctor Creado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al crear el médico', life: 5000 });
        }
      }
      setDoctor(emptyDoctor);
      setDoctorDialog(false);
    }
  }

  const confirmDelete = (doctor) => {
    setDoctor(doctor);
    setDeleteDialog(true);
  }

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  }

  const deleteDoctor = async () => {
    await deleteDoctorWS(doctor);
    let _doctors = doctors.filter(val => val.id !== doctor.id);
    setDoctors(_doctors);
    setDeleteDialog(false);
    
    setDoctor(emptyDoctor);
    toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Especialidad Eliminada', life: 5000 });
  }

  const onDniTypeChange = (e) => setDoctor({ ...doctor, dniType: e.value });

  const onSpecialtiesChange = (e) => setDoctor({ ...doctor, specialties: e.value });

  const onGenderChange = (e) => setDoctor({ ...doctor, gender: e.value });

  const header = (
    <div className="table-header flex justify-content-between">
      Médicos
      <Button label='Nuevo' onClick={() => openNew()} />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-mr-2"
        onClick={() => editDoctor(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-warning"
        onClick={() => confirmDelete(rowData)}
      />
    </>
  );

  const specialtiesBodyTemplate = ({ specialties }) => (
    <div className='specialties-item-value-container'>{specialties?.map(specialty => <div className='specialties-item-value' key={specialty.id}>{specialty.name}</div>)}</div>
  );

  const doctorDialogFooter = (
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
        onClick={() => saveDoctor()}
      />
    </>
  );

  const deleteDialogFooter = (
    <>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-secondary"
        onClick={hideDeleteDialog}
      />
      <Button
        label="Si"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={deleteDoctor}
      />
    </>
  );

  const selectedSpecialtiesTemplate = (option) => {
    if (option) {
      return (
        <div className="specialties-item-value">
          <div>{option.name}</div>
        </div>
      );
    }

    return "Debe escojer una especialidad";
  }

  const monthNavigatorTemplate = (e) => {
    return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1, marginRight: 5 }} />;
}

  const yearNavigatorTemplate = (e) => {
    return <Dropdown value={e.value} options={e.options} filter onChange={(event) => e.onChange(event.originalEvent, event.value)} className="p-ml-2" style={{ lineHeight: 1 }} />;
  }

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={doctors}
        header={header}
        paginator
        rows={10}
        scrollable
        // scrollHeight="flex"
        stripedRows
      >
        <Column field="dni" header="Identificación" />
        <Column field="name" header="Nombres" />
        <Column field="surname" header="Apellidos" />
        <Column header="Especialidades" body={specialtiesBodyTemplate} />
        <Column header="Gestionar" body={actionBodyTemplate} exportable={false} style={{ justifyContent: 'center', minWidth: '8rem' }} />
      </DataTable>

      <Dialog visible={doctorDialog} style={{ width: '550px' }} header="Detalles del doctor" modal className="p-fluid" footer={doctorDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="dniType">Tipo Identificación</label>
          <Dropdown
            id="dniType"
            value={doctor.dniType}
            options={documentList}
            optionLabel="label"
            optionValue="value"
            onChange={onDniTypeChange}
            className={classNames({ 'p-invalid': submitted && !doctor.dniType })}
          />
          {submitted && !doctor.dniType && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="dni">Identificación</label>
          <InputText
            id="dni"
            value={doctor.dni}
            required
            className={classNames({ 'p-invalid': submitted && !doctor.dni })}
            onChange={(e) => onInputChange(e, 'dni')}
          />
          {submitted && !doctor.dni && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="name">Nombres</label>
          <InputText
            id="name"
            value={doctor.name}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !doctor.name })}
            onChange={(e) => onInputChange(e, 'name')}
          />
          {submitted && !doctor.name && <p className="p-error text-sm">El nombre es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="surname">Apellidos</label>
          <InputText
            id="surname"
            value={doctor.surname}
            required
            className={classNames({ 'p-invalid': submitted && !doctor.surname })}
            onChange={(e) => onInputChange(e, 'surname')}
          />
          {submitted && !doctor.surname && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="dniType">Especialidades</label>
          <MultiSelect
            filter
            value={doctor.specialties}
            options={specialties}
            optionLabel="name"
            onChange={onSpecialtiesChange}
            selectedItemTemplate={selectedSpecialtiesTemplate}
            className={classNames({ 'p-invalid': submitted && (doctor.specialties.length <= 0) })}
          />
          {submitted && (doctor.specialties.length <= 0) && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="gender">Género</label>
          <Dropdown
            id="gender"
            value={doctor.gender}
            options={genderList}
            onChange={onGenderChange}
            optionLabel="label"
            optionValue="value"
          />
          {submitted && !doctor.gender && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="birthDate">Fecha de nacimiento</label>
          <Calendar
            id="birthDate"
            value={new Date(doctor.birthDate)}
            onChange={({ value }) => setDoctor({ ...doctor, birthDate: new Date(value).toISOString() })}
            showIcon
            locale="es"
            dateFormat="dd/mm/yy"
            monthNavigator
            yearNavigator
            yearRange="1950:2022"
            monthNavigatorTemplate={monthNavigatorTemplate}
            yearNavigatorTemplate={yearNavigatorTemplate}
            touchUI
            className={classNames({ 'p-invalid': submitted && !doctor.birthDate })}
          />
          {submitted && !doctor.birthDate && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="address">Dirección</label>
          <InputText
            id="address"
            value={doctor.address}
            required
            className={classNames({ 'p-invalid': submitted && !doctor.address })}
            onChange={(e) => onInputChange(e, 'address')}
          />
          {submitted && !doctor.address && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={doctor.email}
            required
            className={classNames({ 'p-invalid': submitted && !doctor.email })}
            onChange={(e) => onInputChange(e, 'email')}
          />
          {submitted && !doctor.email && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono</label>
          <InputText
            id="phone"
            value={doctor.phone}
            required
            className={classNames({ 'p-invalid': submitted && !doctor.phone })}
            onChange={(e) => onInputChange(e, 'phone')}
          />
          {submitted && !doctor.phone && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="city">Ciudad</label>
          <InputText
            id="city"
            value={doctor.city}
            required
            className={classNames({ 'p-invalid': submitted && !doctor.city })}
            onChange={(e) => onInputChange(e, 'city')}
          />
          {submitted && !doctor.city && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
      </Dialog>

      <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirmar" modal className="p-fluid" footer={deleteDialogFooter} onHide={hideDeleteDialog}>
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
          {doctor && <span>¿ Esta seguro de eliminar <b>{doctor.dni} - {doctor.name} {doctor.surname}</b> ?</span>}
        </div>
      </Dialog>
    </>
  )
}