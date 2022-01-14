import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import {
  getSpecialtiesWS,
  saveSpecialtyWS,
  updateSpecialtyWS,
  deleteSpecialtyWS,
} from '../services/specialty.service';

export default function Specialties() {

  const emptySpecialty = {
    name: '',
    description: '',
  };

  const [specialties, setSpecialties] = useState([]);
  const [specialty, setSpecialty] = useState(emptySpecialty);
  const [submitted, setSubmitted] = useState(false);
  const [specialtyDialog, setSpecialtyDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const toast = useRef();

  useEffect(() => {
    fetchSpecialty();
  }, []);

  const fetchSpecialty = async () => {
    const { data } = await getSpecialtiesWS();
    setSpecialties(data);
  }

  const registrationDateBodyTemplate = (rowData) => {
    return <span>{new Date(rowData.registrationDate).toLocaleDateString()}</span>;
  }

  const updateDateBodyTemplate = (rowData) => {
    return <span>{new Date(rowData.updateDate).toLocaleDateString()}</span>;
  }

  const editSpecialty = (specialty) => {
    setSpecialty({...specialty});
    setSpecialtyDialog(true);
}

  const header = (
    <div className="table-header flex justify-content-between">
      Especialidades
      <Button label='Nuevo' onClick={() => openNew()} />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-mr-2"
        onClick={() => editSpecialty(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-warning"
        onClick={() => confirmDelete(rowData)}
      />
    </>
  );

  const openNew = () => {
    setSpecialty(emptySpecialty);
    setSubmitted(false);
    setSpecialtyDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setSpecialtyDialog(false);
    setSpecialtyDialog(false);
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _specialty = {...specialty};
    _specialty[`${name}`] = val;

    setSpecialty(_specialty);
  }

  const saveSpecialty = async () => {
    setSubmitted(true);

    if (specialty.name.trim() && specialty.description.trim()) {
      setSubmitted(false);
      let _specialty = {...specialty};
      if (specialty.id) {
        try {
          const { data: specialtyResponse } = await updateSpecialtyWS(_specialty);
          setSpecialties(specialties.map((val) => (val.id === specialty.id) ? val = specialtyResponse : val))
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Especialidad Actualizada', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al actualizar la especialidad', life: 5000 });
        }
      } else {
        try {
          const { data: specialtyResponse } = await saveSpecialtyWS(_specialty);
          setSpecialties([...specialties, specialtyResponse]);
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Especialidad Creada', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al crear la especialidad', life: 5000 });
        }
      }

      setSpecialty(emptySpecialty);
      setSpecialtyDialog(false);
    }
  }

  const confirmDelete = (specialty) => {
    setSpecialty(specialty);
    setDeleteDialog(true);
  }

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  }

  const deleteSpecialty = async () => {
    await deleteSpecialtyWS(specialty);
    let _specialties = specialties.filter(val => val.id !== specialty.id);
    setSpecialties(_specialties);
    setDeleteDialog(false);
    
    setSpecialty(emptySpecialty);
    toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Especialidad Eliminada', life: 5000 });
  }

  const specialtyDialogFooter = (
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
        onClick={() => saveSpecialty()}
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
        onClick={deleteSpecialty}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={specialties}
        header={header}
        paginator
        rows={10}
        scrollable
        // scrollHeight="flex"
        stripedRows
      >
        <Column field="name" header="Nombre" />
        <Column field="description" header="Descripción" />
        <Column header="Gestionar" body={actionBodyTemplate} exportable={false} style={{ justifyContent: 'center', minWidth: '8rem' }}></Column>
      </DataTable>

      <Dialog visible={specialtyDialog} style={{ width: '550px' }} header="Detalles de la especialidad" modal className="p-fluid" footer={specialtyDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <InputText
            id="name"
            value={specialty.name}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !specialty.name })}
            onChange={(e) => onInputChange(e, 'name')}
          />
          {submitted && !specialty.name && <p className="p-error text-sm">El nombre es requerido.</p>}
          </div>
          <div className="field">
          <label htmlFor="description">Descripción</label>
          <InputText
            id="description"
            value={specialty.description}
            required
            className={classNames({ 'p-invalid': submitted && !specialty.description })}
            onChange={(e) => onInputChange(e, 'description')}
          />
          {submitted && !specialty.description && <p className="p-error text-sm">La descripción es requerido.</p>}
        </div>
      </Dialog>

      <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirmar" modal className="p-fluid" footer={deleteDialogFooter} onHide={hideDeleteDialog}>
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
          {specialty && <span>¿ Esta seguro de eliminar <b>{specialty.name}</b> ?</span>}
        </div>
      </Dialog>
    </>
  )
}