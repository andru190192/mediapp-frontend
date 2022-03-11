import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';

import {
  getExamsWS,
  saveExamWS,
  updateExamWS,
  deleteExamWS,
} from '../services/exam.service';

export default function Exams() {

  const emptyExam = {
    name: '',
  };

  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(emptyExam);
  const [submitted, setSubmitted] = useState(false);
  const [examDialog, setExamDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const toast = useRef();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data } = await getExamsWS();
    setExams(data);
  }

  const registrationDateBodyTemplate = (rowData) => {
    return <span>{new Date(rowData.registrationDate).toLocaleDateString()}</span>;
  }

  const updateDateBodyTemplate = (rowData) => {
    return <span>{new Date(rowData.updateDate).toLocaleDateString()}</span>;
  }

  const editExam = (exam) => {
    setExam({...exam});
    setExamDialog(true);
}

  const header = (
    <div className="table-header flex justify-content-between">
      Exámenes de Laboratorio
      <Button label='Nuevo' onClick={() => openNew()} />
    </div>
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-mr-2"
        onClick={() => editExam(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-warning"
        onClick={() => confirmDelete(rowData)}
      />
    </>
  );

  const openNew = () => {
    setExam(emptyExam);
    setSubmitted(false);
    setExamDialog(true);
  }

  const hideDialog = () => {
    setSubmitted(false);
    setExamDialog(false);
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _exam = {...exam};
    _exam[`${name}`] = val;

    setExam(_exam);
  }

  const saveExam = async () => {
    setSubmitted(true);

    if (exam.name.trim()) {
      setSubmitted(false);
      let _exam = {...exam};
      if (exam.id) {
        try {
          const { data: examResponse } = await updateExamWS(_exam);
          setExams(exams.map((val) => (val.id === exam.id) ? val = examResponse : val))
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Examen Actualizado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un problema al actualizar el examen', life: 5000 });
        }
      } else {
        try {
          console.log('_exam', _exam);
          const { data: examResponse } = await saveExamWS(_exam);
          setExams([...exams, examResponse]);
          toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Examen Creado', life: 5000 });
        } catch (error) {
          return toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se puede crear un examen con un nombre que ya existe', life: 5000 });
        }
      }

      setExam(emptyExam);
      setExamDialog(false);
    }
  }

  const confirmDelete = (exam) => {
    setExam(exam);
    setDeleteDialog(true);
  }

  const hideDeleteDialog = () => {
    setDeleteDialog(false);
  }

  const deleteExam = async () => {
    try{
      await deleteExamWS(exam);
      let _exams = exams.filter(val => val.id !== exam.id);
      setExams(_exams);
      setDeleteDialog(false);
      
      setExam(emptyExam);
      toast.current.show({ severity: 'success', summary: 'Exitoso', detail: 'Examen Eliminado', life: 5000 });
    } catch (e) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se puede eliminar un examen que se está utilizado en una consulta', life: 5000 });
    }
  }

  const examDialogFooter = (
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
        onClick={() => saveExam()}
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
        onClick={deleteExam}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        value={exams}
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

      <Dialog visible={examDialog} style={{ width: '550px' }} header="Detalles del examen" modal className="p-fluid" footer={examDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <InputText
            id="name"
            value={exam.name}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !exam.name })}
            onChange={(e) => onInputChange(e, 'name')}
          />
          {submitted && !exam.name && <p className="p-error text-sm">El nombre es requerido.</p>}
          </div>
      </Dialog>

      <Dialog visible={deleteDialog} style={{ width: '450px' }} header="Confirmar" modal className="p-fluid" footer={deleteDialogFooter} onHide={hideDeleteDialog}>
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem'}} />
          {exam && <span>¿ Esta seguro de eliminar <b>{exam.name}</b> ?</span>}
        </div>
      </Dialog>
    </>
  )
}