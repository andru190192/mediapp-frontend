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

import {
  getSpecialtiesWS,
} from '../services/specialty.service';
import {
  getDoctorsBySpecialtyWS,
} from '../services/doctor.service';
import {
  validateSchedulesWS,
  saveAppointmentWS,
} from '../services/appointments.service';

const ScheduleAppointment = () => {

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

  const [showTable, setShowTable] = useState(false);
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

  useEffect(() => {
    const patient = JSON.parse(localStorage.getItem("patient"));
    console.log('patient', patient);
    setAppointment({
      ...appointment,
      patient,
    });
    fetchSpecialty();
  }, []);

  const fetchSpecialty = async () => {
    const { data } = await getSpecialtiesWS();
    setSpecialties(data);
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

  const validateSchedules = async () => {
    setSubmitted(true);

    if (appointment.specialty && appointment.reason !== '') {
      setSubmitted(false);
      const { data: { data: { appointments } }} = await validateSchedulesWS({
        idSpecialty: appointment.specialty.id,
        idPatient: appointment.patient.id,
        timestamp: DateTime.fromISO(new Date(appointment.timestamp).toISOString()).toISO({ includeOffset: false })
      });
      setAppointments(appointments);
      setAppointmentsFilter(appointments);
      const _doctors = appointments.map(appointment => appointment.doctor);
      setDoctors([...new Map(_doctors.map(doctor => [doctor.id, doctor])).values()]);
      setShowTable(true);
    }
  }

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        className="p-button-rounded p-button-warning"
        label='Agendar'
        onClick={() => onHandlerAppointment(rowData)}
      />
    </>
  );

  const onHandlerAppointment = async (row) => {
    console.error('row', row);
    const { 
      doctor,
      specialty,
      patient,
      timestamp,
      duration,
      reason,
      comment,
      diagnostic,
      prescription,
    } = row;
    const _appointment = {
      ...appointment,
      doctor: { id: doctor.id },
      timestamp,
    }
    console.log('appointment', _appointment);
    try {
      await saveAppointmentWS(_appointment);
      setAppointments([]);
      const patient = JSON.parse(localStorage.getItem("patient"));
      setAppointment({ ...emptyAppointment, patient });
      toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Se agendo correctamente la cita', life: 5000 });
    } catch (error) {
      console.log(error?.response?.data?.error);
      const { title, message} = error?.response?.data?.error;
        return toast.current.show({ severity: 'error', summary: title, detail: message, life: 5000 });
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
      // <Calendar 
      //   // timeOnly
      //   value={options.value}
      //   onChange={(e) => options.filterCallback(e.value, options.index)} />
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

  return (
    <>
      <h1>Citas Médicas</h1>
      <div className="shadow-2 surface-card p-4 border-round formgroup-inline">
        <div className="field col">
          <label htmlFor="specialty">Especialidad</label>
          <Dropdown
            id="specialty"
            placeholder='Escoja una especialidad'
            value={appointment.specialty}
            options={specialties}
            optionLabel="name"
            onChange={onSpecialtyChange}
            className={classNames({ 'p-invalid': submitted && !appointment.specialty })}
            filter
            showFilterClear
            emptyFilterMessage='No se han encontrado resultados'
          />
          {submitted && !appointment.specialty && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <div className="field col">
          <label htmlFor="birthDate">Fecha</label>
          <Calendar
            id="date"
            value={new Date(appointment.timestamp)}
            onChange={({ value }) => setAppointment({ ...appointment, timestamp: value })}
            showIcon
            locale="es"
            dateFormat="dd/mm/yy"
            monthNavigator
            yearNavigator
            yearRange="2022:2030"
            readOnlyInput
            disabledDays={[0, 6]}
            minDate={new Date()}
          />
        </div>
        <div className="field col">
          <InputText
            value={appointment.reason}
            required
            className={classNames({ 'p-invalid': submitted && !appointment.reason })}
            onChange={(e) => setAppointment({ ...appointment, reason: e?.target?.value })}
            placeholder='Motivo de la consulta'
          />
          {submitted && !appointment.reason && <p className="p-error text-sm">Este campo es requerido.</p>}
        </div>
        <Button label="Buscar" icon="pi pi-search" className="p-button-primary" onClick={() => validateSchedules()} />
      </div>

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
        globalFilterFields={['doctor.dni', 'doctor.name', 'doctor.surname']}
        header={renderHeader}
        cellClassName='text-center'
      >
        <Column
          filter
          header="Médico"
          field="doctor.id"
          filterField='doctor'
          body={doctorColumnTable}
          showFilterMenu={false}
          style={{ minWidth: '1rem' }}
          bodyClassName="text-center"
          filterElement={doctorFilterTemplate}
        />
        {/* <Column body={dateColumnTable} header="Fecha" /> */}
        <Column
          filter
          header="Hora"
          field="timestamp"
          filterField="timestamp"
          body={timeColumnTable}
          dataType="date"
          showFilterMenu={false}
          filterElement={timeFilterTemplate}
          //filterMatchModeOptions={matchModes}
          onFilterClear={() => setAppointments(appointmentsFilter)}
        />
        <Column
          header="Gestionar"
          body={actionBodyTemplate}
          exportable={false}
          style={{ justifyContent: 'center', minWidth: '8rem' }}
          bodyClassName="text-center"
        />
      </DataTable>}
      <Toast ref={toast} />
    </>
  )
}

export default ScheduleAppointment;