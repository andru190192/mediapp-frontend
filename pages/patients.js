import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

import {
  getPatientWS,
  savePatientWS,
  updatePatientWS,
  deletePatientWS,
} from '../services/patient.service';
import { locale_ES } from '../util/date';

export default function Patients() {

  addLocale('es', locale_ES);

  const emptyPatient = {
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

  const [patient, setPatient] = useState(emptyPatient);
  const [patients, setPatients] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [patientDialog, setPatientDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const toast = useRef();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data } = await getPatientWS();
    setPatients(data);
  }

  const editPatient = (patient) => {
    setPatient({...patient});
    setPatientDialog(true);
  }

  const openNew = () => {
    setPatient(emptyPatient);
    setSubmitted(false);
    setPatientDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setPatientDialog(false);
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _patient = {...patient};
    _patient[`${name}`] = val;

    setPatient(_patient);
  }

  const savePatient = async () => {
    setSubmitted(true);

    if (patient.dni.trim() && patient.name.trim()) {
      setSubmitted(false);
      let _patient = {...patient};
      if (patient.id) {
        try {
          const { data: patientResponse } = await updatePatientWS(_patient);
          setPatients(patients.map((val) => (val.id === patient.id) ? val = patientResponse : val))
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'patient Actualizado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al actualizar el paciente', life: 5000 });
        }
        
      } else {
        try {
          const { data: patientResponse } = await savePatientWS(_patient);
          setPatients([...patients, patientResponse]);
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'patient Creado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al crear el paciente', life: 5000 });
        }
      }
      setPatient(emptyPatient);
      setPatientDialog(false);
    }
  }

  const confirmDelete = (patient) => {
    setPatient(patient);
    setDeleteDialog(true);
  }

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  }

  const deletePatient = async () => {
    await deletePatientWS(patient);
    let _patients = patients.filter(val => val.id !== patient.id);
    setPatients(_patients);
    setDeleteDialog(false);
    
    setPatient(emptyPatient);
    toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Especialidad Eliminada', life: 5000 });
  }

  const onDniTypeChange = (e) => setPatient({ ...patient, dniType: e.value });

  const onGenderChange = (e) => setPatient({ ...patient, gender: e.value });

  const header = (
    <div className="table-header flex justify-content-between">
      Pacientes
      <Button label='Nuevo' onClick={() => openNew()} />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-mr-2"
        onClick={() => editPatient(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-warning"
        onClick={() => confirmDelete(rowData)}
      />
    </>
  );

  const patientDialogFooter = (
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
        onClick={() => savePatient()}
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
        onClick={deletePatient}
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
        value={patients}
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
        <Column header="Gestionar" body={actionBodyTemplate} exportable={false} style={{ justifyContent: 'center', minWidth: '8rem' }} />
      </DataTable>

      <Dialog visible={patientDialog} style={{ width: '550px' }} header="Detalles del paciente" modal className="p-fluid" footer={patientDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="dniType">Tipo Identificación</label>
          <Dropdown
            id="dniType"
            value={patient.dniType}
            options={documentList}
            optionLabel="label"
            optionValue="value"
            onChange={onDniTypeChange}
            className={classNames({ 'p-invalid': submitted && !patient.dniType })}
          />
          {submitted && !patient.dniType && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="dni">Identificación</label>
          <InputText
            id="dni"
            value={patient.dni}
            required
            className={classNames({ 'p-invalid': submitted && !patient.dni })}
            onChange={(e) => onInputChange(e, 'dni')}
          />
          {submitted && !patient.dni && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="name">Nombres</label>
          <InputText
            id="name"
            value={patient.name}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !patient.name })}
            onChange={(e) => onInputChange(e, 'name')}
          />
          {submitted && !patient.name && <p className="p-error text-sm">El nombre es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="surname">Apellidos</label>
          <InputText
            id="surname"
            value={patient.surname}
            required
            className={classNames({ 'p-invalid': submitted && !patient.surname })}
            onChange={(e) => onInputChange(e, 'surname')}
          />
          {submitted && !patient.surname && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="gender">Género</label>
          <Dropdown
            id="gender"
            value={patient.gender}
            options={genderList}
            onChange={onGenderChange}
            optionLabel="label"
            optionValue="value"
          />
          {submitted && !patient.gender && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="birthDate">Fecha de nacimiento</label>
          <Calendar
            id="birthDate"
            value={new Date(patient.birthDate)}
            onChange={({ value }) => setPatient({ ...patient, birthDate: new Date(value).toISOString() })}
            showIcon
            locale="es"
            dateFormat="dd/mm/yy"
            monthNavigator
            yearNavigator
            yearRange="1950:2022"
            monthNavigatorTemplate={monthNavigatorTemplate}
            yearNavigatorTemplate={yearNavigatorTemplate}
            touchUI
            className={classNames({ 'p-invalid': submitted && !patient.birthDate })}
          />
          {submitted && !patient.birthDate && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="address">Dirección</label>
          <InputText
            id="address"
            value={patient.address}
            required
            className={classNames({ 'p-invalid': submitted && !patient.address })}
            onChange={(e) => onInputChange(e, 'address')}
          />
          {submitted && !patient.address && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={patient.email}
            required
            className={classNames({ 'p-invalid': submitted && !patient.email })}
            onChange={(e) => onInputChange(e, 'email')}
          />
          {submitted && !patient.email && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono</label>
          <InputText
            id="phone"
            value={patient.phone}
            required
            className={classNames({ 'p-invalid': submitted && !patient.phone })}
            onChange={(e) => onInputChange(e, 'phone')}
          />
          {submitted && !patient.phone && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="city">Ciudad</label>
          <InputText
            id="city"
            value={patient.city}
            required
            className={classNames({ 'p-invalid': submitted && !patient.city })}
            onChange={(e) => onInputChange(e, 'city')}
          />
          {submitted && !patient.city && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
      </Dialog>

      <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirmar" modal className="p-fluid" footer={deleteDialogFooter} onHide={hideDeleteDialog}>
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
          {patient && <span>¿ Esta seguro de eliminar <b>{patient.dni} - {patient.name} {patient.surname}</b> ?</span>}
        </div>
      </Dialog>
    </>
  )
}