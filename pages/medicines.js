import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';

import {
  getMedicineWS,
  saveMedicineWS,
  updateMedicineWS,
  deleteMedicineWS,
} from '../services/medicine.service';

export default function Medicines() {

  const emptyMedicine = {
    name: '',
  };

  const [medicines, setMedicines] = useState([]);
  const [medicine, setMedicine] = useState(emptyMedicine);
  const [submitted, setSubmitted] = useState(false);
  const [medicineDialog, setMedicineDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const toast = useRef();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    const { data } = await getMedicineWS();
    setMedicines(data);
  }

  const registrationDateBodyTemplate = (rowData) => {
    return <span>{new Date(rowData.registrationDate).toLocaleDateString()}</span>;
  }

  const updateDateBodyTemplate = (rowData) => {
    return <span>{new Date(rowData.updateDate).toLocaleDateString()}</span>;
  }

  const editMedicine = (medicine) => {
    setMedicine({...medicine});
    setMedicineDialog(true);
}

  const header = (
    <div className="table-header flex justify-content-between">
      Medicinas
      <Button label='Nuevo' onClick={() => openNew()} />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-mr-2"
        onClick={() => editMedicine(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-warning"
        onClick={() => confirmDelete(rowData)}
      />
    </>
  );

  const openNew = () => {
    setMedicine(emptyMedicine);
    setSubmitted(false);
    setMedicineDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setMedicineDialog(false);
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _medicine = {...medicine};
    _medicine[`${name}`] = val;

    setMedicine(_medicine);
  }

  const saveMedicine = async () => {
    setSubmitted(true);

    if (medicine.name.trim()) {
      setSubmitted(false);
      let _medicine = {...medicine};
      if (medicine.id) {
        try {
          const { data: medicineResponse } = await updateMedicineWS(_medicine);
          setMedicines(medicines.map((val) => (val.id === medicine.id) ? val = medicineResponse : val))
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'medicineen Actualizado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al actualizar el medicineen', life: 5000 });
        }
      } else {
        try {
          console.log('_medicine', _medicine);
          const { data: medicineResponse } = await saveMedicineWS(_medicine);
          setMedicines([...medicines, medicineResponse]);
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Medicamento Creado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al crear el medicamento', life: 5000 });
        }
      }

      setMedicine(emptyMedicine);
      setMedicineDialog(false);
    }
  }

  const confirmDelete = (medicine) => {
    setMedicine(medicine);
    setDeleteDialog(true);
  }

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  }

  const deleteMedicine = async () => {
    try{
      await deleteMedicineWS(medicine);
      let _medicines = medicines.filter(val => val.id !== medicine.id);
      setMedicines(_medicines);
      setDeleteDialog(false);
      
      setMedicine(emptyMedicine);
      toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Medicina Eliminada', life: 5000 });
    } catch (e) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar una medicina que se está utilizado en una receta', life: 5000 });
    }
  }

  const medicineDialogFooter = (
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
        onClick={() => saveMedicine()}
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
        onClick={deleteMedicine}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={medicines}
        header={header}
        paginator
        rows={10}
        scrollable
        // scrollHeight="flex"
        stripedRows
      >
        <Column field="id" header="Código" />
        <Column field="name" header="Nombre" />
        <Column header="Gestionar" body={actionBodyTemplate} exportable={false} style={{ justifyContent: 'center', minWidth: '8rem' }}></Column>
      </DataTable>

      <Dialog visible={medicineDialog} style={{ width: '550px' }} header="Detalles del medicamento" modal className="p-fluid" footer={medicineDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <InputText
            id="name"
            value={medicine.name}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !medicine.name })}
            onChange={(e) => onInputChange(e, 'name')}
          />
          {submitted && !medicine.name && <p className="p-error text-sm">El nombre es requerido.</p>}
          </div>
      </Dialog>

      <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirmar" modal className="p-fluid" footer={deleteDialogFooter} onHide={hideDeleteDialog}>
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
          {medicine && <span>¿ Esta seguro de eliminar <b>{medicine.name}</b> ?</span>}
        </div>
      </Dialog>
    </>
  )
}