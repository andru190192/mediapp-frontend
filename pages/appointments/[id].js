import { useState, useEffect, useRef } from 'react'
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';;
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputText';
import { TabView, TabPanel } from 'primereact/tabview';
import { Fieldset } from 'primereact/fieldset';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { addLocale } from 'primereact/api';
import { locale_ES } from '../../util/date';
import { useRouter } from 'next/router';

import {
  getById,
  updateAppointmentWS
} from '../../services/appointments.service';

import {
  getExamsWS,
} from '../../services/exam.service';

import {
  getMedicineWS,
} from '../../services/medicine.service';

const Appointment = ({ data }) => {

  const { id } = data;

  addLocale('es', locale_ES);

  const emptyRecipe = {
    idAppointment: id,
    medicine: {
      id: '',
      name: '',
    },
    amount: 0,
    prescription: '',
  };

  const emptyMedicine = {
    id: '',
  };

  const [appointment, setAppointment] = useState(data);
  const [exams, setExams] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [recipe, setRecipe] = useState(emptyRecipe);
  const [medicine, setMedicine] = useState(emptyMedicine);
  const [medicines, setMedicines] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toast = useRef();
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) router.push('/');
    fetchExams();
    fetchMedicines();
  }, []);

  const fetchExams = async () => {
    const { data } = await getExamsWS();
    setExams(data);
  }

  const fetchMedicines = async () => {
    const { data } = await getMedicineWS();
    setMedicines(data);
  }

  const handlerUpdateAppointment = () => {
    setSubmitted(true);

    if(appointment.diagnostic !== '') {
      setSubmitted(false);
      const _recipes = recipes.map(e => {
        return {
          id: {
            idAppointment: e.idAppointment,
            idMedicine: e.medicine.id,
          },
          amount: parseInt(e.amount),
          prescription: e.prescription,
        }
      });
      const _appointment = {...appointment};
      _appointment.recipes = _recipes;
      _appointment.status = 1;
      setAppointment(_appointment);
      console.log('_appointment', _appointment)
      updateAppointmentWS(_appointment);
      toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Se guardo correctamente la información', life: 5000 });
    }
  }

  const onExamsChange = (e) => setAppointment({ ...appointment, laboratoryExams: e.value });

  const openDialog = () => {
    setShowDialog(true);
    setSubmitted(false);
    setRecipe(emptyRecipe);
  }

  const hideDialog = () => {
    setShowDialog(false);
    setSubmitted(false);
  }

  const addMedicine = async () => {
    setSubmitted(true);

    if (recipe.amount > 0 && recipe.prescription) {
      setSubmitted(false);
      setShowDialog(false);
      setMedicine(emptyMedicine);
      setRecipes([...recipes, recipe])
    }
  }

  const onMedicineChange = (e) => {
    setMedicine(e.value);
    setRecipe({ ...recipe, medicine: e.value });
  }

  const handlerDeleteMedicine = (rowData) => {
    let _recipes = recipes.filter(val => val.medicine.id !== rowData.medicine.id);
    console.log('_recipes', _recipes);
    setRecipes(_recipes);
  }

  const actionBodyTemplate = () => (
    <div className='text-center mt-3'>
      <Button
        className="p-button-rounded p-button-primary"
        label='Guardar'
        onClick={handlerUpdateAppointment}
      />
    </div>
  );

  const dataTableManageTemplate = (rowData) => (
    <div className='text-center mt-3'>
      <Button
        className="p-button-rounded p-button-danger"
        label='Eliminar'
        onClick={() => handlerDeleteMedicine(rowData)}
      />
    </div>
  );

  const header = (
    <div className="table-header flex justify-content-between">
      <Button label='Agregar' onClick={() => openDialog()} />
    </div>
  );

  const selectedExamsTemplate = (option) => {
    if (option) {
      return (
        <div className="specialties-item-value">
          <div>{option.name}</div>
        </div>
      );
    }

    return "Listado de examenes";
  }

  const dialogFooter = (
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
        onClick={() => addMedicine()}
      />
    </>
  );

  return (
    <>
      <div className="card">
        <Fieldset legend="Consulta">
        <p><span>Motivo: </span>{appointment.reason}</p>
            
            <div className="field">
              <label htmlFor="comment">Comentario: </label>
              <InputText id="comment" value={appointment.comment} onChange={(e) => setAppointment({ ...appointment, comment: e.target.value })} />
            </div>

            <div className="field">
              <label htmlFor="diagnostic">Diagnóstico: </label>
              <InputText
                id="diagnostic"
                value={appointment.diagnostic}
                onChange={(e) => setAppointment({ ...appointment, diagnostic: e.target.value })}
                
                className={classNames({ 'p-invalid': submitted && !appointment.diagnostic })}
                />
                {submitted && !appointment.diagnostic && <p className="p-error text-sm">Este campo es requerido.</p>}
            </div>
        </Fieldset>
        <Fieldset legend="Paciente" className='mt-3'>
          <div className='grid'>
            <div className="field col-4">
              <label htmlFor="id">Código:</label>
              <span id="id"> {appointment.patient.id}</span>
            </div>
            <div className="field col-4">
              <label htmlFor="dni">Identificación:</label>
              <span id="dni"> {appointment.patient.dni}</span>
            </div>
            <div className="field col-4">
              <label htmlFor="name">Nombres:</label>
              <span id="name"> {appointment.patient.name}</span>
            </div>
            <div className="field col-4">
              <label htmlFor="surname">Apellidos:</label>
              <span id="surname"> {appointment.patient.surname}</span>
            </div>
            <div className="field col-4">
              <label htmlFor="address">Dirección:</label>
              <span id="address"> {appointment.patient.address}</span>
            </div>
            <div className="field col-4">
              <label htmlFor="city">Ciudad:</label>
              <span id="city"> {appointment.patient.city}</span>
            </div>
          </div>
        </Fieldset>
        <Fieldset legend="Examenes" className='mt-3'>
          <div className="field">
            <MultiSelect
              filter
              value={appointment.laboratoryExams}
              options={exams}
              optionLabel="name"
              onChange={onExamsChange}
              selectedItemTemplate={selectedExamsTemplate}
            />
          </div>
          {/* <DataTable
            value={appointment.laboratoryExams}
            showGridlines
            paginator
            rows={10}
            scrollable
            // scrollHeight="flex"
            stripedRows
            emptyMessage='No se han encontrado resultados'
          >
            <Column field="id" header="Código" />
            <Column field="name" header="Nombre" />
          </DataTable> */}
        </Fieldset>
        <Fieldset legend="Medicinas" className='mt-3'>
          <DataTable
            value={recipes}
            header={header}
            showGridlines
            paginator
            rows={10}
            scrollable
            // scrollHeight="flex"
            stripedRows
            emptyMessage='No se han encontrado resultados'
          >
            <Column field="medicine.name" header="Medicamento" />
            <Column field="amount" header="Cantidad" />
            <Column field="prescription" header="Prescripción" />
            <Column header="Gestionar" body={dataTableManageTemplate} exportable={false} style={{ justifyContent: 'center', minWidth: '8rem' }}></Column>
          </DataTable>
        </Fieldset>
      </div>
      {actionBodyTemplate()}
      <Dialog
        visible={showDialog}
        style={{ width: '550px' }}
        header="Detalles"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="medicine">Medicamento</label>
          <Dropdown
            id="medicine"
            value={recipe.medicine}
            options={medicines}
            optionLabel="name"
            onChange={onMedicineChange}
            filter
            className={classNames({ 'p-invalid': submitted && !medicine.id })}
          />
          {submitted && !medicine.id && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="amount">Cantidad</label>
          <InputText
            id="amount"
            value={recipe.amount}
            required
            className={classNames({ 'p-invalid': submitted && !recipe.amount })}
            onChange={(e) => setRecipe({ ...recipe, amount: e.target.value })}
          />
          {submitted && !recipe.amount && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field">
          <label htmlFor="amount">Prescripción</label>
          <InputText
            id="prescription"
            value={recipe.prescription}
            required
            className={classNames({ 'p-invalid': submitted && !recipe.prescription })}
            onChange={(e) => setRecipe({ ...recipe, prescription: e.target.value })}
          />
          {submitted && !recipe.prescription && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
      </Dialog>
      <Toast ref={toast} />
    </>
  )
}

export async function getServerSideProps(context) {

  // Fetch data from external API
  const { id } = context.params;
  const { data } = await getById(id);
  console.log('data', data)

  // Pass data to the page via props
  return { props: { data } }
}

export default Appointment;