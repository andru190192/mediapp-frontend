import { useState, useEffect, useRef } from 'react'
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputText';
import { MultiSelect } from 'primereact/multiselect';
import { addLocale, FilterMatchMode, FilterOperator, FilterService } from 'primereact/api';
import { locale_ES } from '../util/date';
import { DateTime } from "luxon";
import { useLogin } from '../hooks/useLogin';
import { useRouter } from 'next/router';


import {
  getSpecialtiesWS,
} from '../services/specialty.service';
import {
  getDoctorsBySpecialtyWS,
} from '../services/doctor.service';
import {
  updateAppointmentWS,
  getByPatientAndDateAndStatus,
  getByPatientAndStatus,
} from '../services/appointments.service';

const Appointments = () => {

  addLocale('es', locale_ES);

  let minDate = new Date();

  const emptyAppointment = {
    specialty: undefined,
    timestamp: new Date().toISOString(),
    duration: 30,
    reason: '',
    comment: '',
    diagnostic: '',
    prescription: '',
  };

  const [rate, setRate] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [rateDialog, setRateDialog] = useState(false);
  const [patient, setPatient] = useState({});
  const [specialties, setSpecialties] = useState([]);
  const [appointment, setAppointment] = useState(emptyAppointment);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsFilter, setAppointmentsFilter] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sheduleDialog, setSheduleDialog] = useState(false);
  const [filters, setFilters] = useState({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'doctor': { value: null, matchMode: FilterMatchMode.IN },
    'timestamp': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const toast = useRef();
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) router.push('/');
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const patient = await JSON.parse(localStorage.getItem("patient"));
      console.log('patient', patient);
      const { data } = await getByPatientAndStatus({
        patient: patient,
        status: 3, // estado atendido
      });
      setAppointments(data);
      setShowTable(true); 
    }catch(error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un error', life: 5000 });
    }
  }

  const onSpecialtyChange = (e) => {
    setAppointment({ ...appointment, specialty: e.value });
    setShowTable(false);
  }

  function isoDateWithoutTimeZone(date) {
    if (date == null) return date;
    var timestamp = date.getTime() - date.getTimezoneOffset() * 60000;
    var correctDate = new Date(timestamp);
    return correctDate.toISOString();
  }

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _appointment = {...appointment};
    _appointment[`${name}`] = val;

    setAppointment(_appointment);
  }

  const getAppointments = async () => {
    setSubmitted(true);
    
      setSubmitted(false);
      try {
        const { data } = await getByPatientAndDateAndStatus({
          patient: appointment.patient,
          timestamp: DateTime.fromISO(new Date(appointment.timestamp).toISOString()).toISO({ includeOffset: false }),
          status: 0, // estado agendado
        });
        setAppointments(data);
        setShowTable(true); 
      }catch(error) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un error', life: 5000 });
      }
  }

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        className="p-button-rounded p-button-info"
        label='Calificar'
        onClick={() => openRateModal(rowData)}
      />
    </>
  );

  const openRateModal = (rowData) => {
    console.log('rowData', rowData);
    setAppointment({ ...rowData })
    setRateDialog(true);
  }

  const onHandlerRateAppointment = async () => {
    const _appointment = {
      ...appointment,
      status: 3,
      rate
    }
    console.log('appointment', _appointment);
    try {
      await updateAppointmentWS(_appointment);
      //await fetchAppointments();
      //setAppointments([]);
      toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Se califico correctamente la cita', life: 5000 });
      setRate(0);
      setRateDialog(false);
    } catch (error) {
      console.log(error?.response?.data?.error);
        return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un error al guardar la calificación', life: 5000 });
    }
  }

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
}

const filterDoctorCallback = (e, options) => {
  options.filterApplyCallback(e.value)
}

  const doctorColumnTable = ({ doctor: { name, surname }}) => {
    return <span>{`${name} ${surname}`}</span>
  }

  const dateColumnTable = ({ timestamp }) => {
    return <span>{new Date(timestamp).toLocaleDateString()}</span>;
  }

  const timeColumnTable = ({ timestamp }) => {
    return <span>{new Date(timestamp).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</span>;
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} />
        </span>
      </div>
    )
  }

  const doctorFilterTemplate = (options) => {
    return (
      <MultiSelect
        value={options.value}
        options={doctors}
        itemTemplate={doctorItemTemplate}
        placeholder="Filtrar"
        className="p-column-filter"
        onChange={(e) => filterDoctorCallback(e, options)}
        optionLabel="name"
      />
    )
  }

  const doctorItemTemplate = (option) => {
    return (
      <div className="p-multiselect-representative-option">
        <span className="image-text">{`${option.name} ${option.surname}`}</span>
      </div>
    );
  }

  const timeFilterTemplate = (options) => {
    const dates = appointmentsFilter.map(e => e.timestamp)
    return (
      <MultiSelect
        value={options.value}
        options={[...new Set(dates)]}
        itemTemplate={timeItemTemplate}
        placeholder="Filtrar"
        className="p-column-filter"
        onChange={(e) => filterTimeCallback(e, options)}
      />
    )
  }

  const filterTimeCallback = (e, options) => {
    console.error('error', e.value);
    if (e.value.length === 0) return;
      const time = { ...e };
    //   const filtered = appointmentsFilter.filter(appointment => {
    //   return appointment.timestamp.toString() === time.value.toString();
    // });
    
    const filtered = appointments.filter(appointment => time.value.includes(appointment.timestamp));

    setAppointments(filtered);

    options.filterApplyCallback(e.value)
  }

  const timeItemTemplate = (option) => {
    return <span>{new Date(option).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</span>;
  }

  const hideDialog = () => {
    setSubmitted(false);
    setRateDialog(false);
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
        onClick={() => onHandlerRateAppointment()}
      />
    </>
  );

  return (
    <>
      {showTable && <DataTable
        value={appointments}
        showGridlines
        // scrollHeight="flex"
        className='mt-3'
        emptyMessage='No se han encontrado resultados'
        groupRowsBy="doctor.id"
        sortMode="single"
        sortField="doctor.id"
        sortOrder={1}
        responsiveLayout="scroll"
        rowGroupMode="rowspan"
        filterDisplay="row"
        // filterDisplay="menu"
        filters={filters}
        globalFilterFields={['doctor.dni', 'doctor.name', 'doctor.surname', 'specialty.name']}
        header={renderHeader}
        cellClassName='text-center'
      >
        <Column
          header="Médico"
          field="doctor.id"
          body={doctorColumnTable}
          showFilterMenu={false}
          style={{ minWidth: '1rem' }}
        />
        <Column
          header="Especialidad"
          field="specialty.name"
          showFilterMenu={false}
          style={{ minWidth: '1rem' }}
        />
        <Column body={dateColumnTable} header="Fecha" />
        <Column
          header="Hora"
          field="timestamp"
          body={timeColumnTable}
          dataType="date"
          showFilterMenu={false}
        />
        <Column
          header="Gestionar"
          body={actionBodyTemplate}
          exportable={false}
          style={{ justifyContent: 'center', minWidth: '8rem' }}
        />
      </DataTable>}
      <Toast ref={toast} />

      <Dialog visible={rateDialog} style={{ width: '550px' }} header="Detalles de la especialidad" modal className="p-fluid" footer={specialtyDialogFooter} onHide={hideDialog}>
        <div className="field">
          <label htmlFor="name">Calificación</label>
          <InputText
            id="rate"
            value={rate}
            required
            autoFocus
            className={classNames({ 'inputfield w-full p-invalid': submitted && !specialty.name })}
            onChange={(e) => setRate(e.target.value)}
          />
          {submitted && !appointment.rate && <p className="p-error text-sm">La es requerida.</p>}
          </div>
      </Dialog>
    </>
  )
}

export default Appointments;