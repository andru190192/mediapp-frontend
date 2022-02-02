import React, { useState, useEffect, useRef } from 'react'
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
  PDFViewer,
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

import {
  getByPatientAndDateAndStatus,
} from '../services/appointments.service';
import {
  getByAppointment,
} from '../services/recipe.service';

const Recipes = () => {

  addLocale('es', locale_ES);

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
  const [showPdfViewer, setShowPdfViewer] = useState(false);
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
  const [recipes, setRecipes] = useState([]);
  const toast = useRef();
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const patient = JSON.parse(localStorage.getItem("patient"));
    if (!user) router.push('/');
    setAppointment({
      ...appointment,
      patient,
    });
    console.log('router.query', router.query);
  }, []);

  function isoDateWithoutTimeZone(date) {
    if (date == null) return date;
    var timestamp = date.getTime() - date.getTimezoneOffset() * 60000;
    var correctDate = new Date(timestamp);
    return correctDate.toISOString();
  }

  const getAppointments = async () => {
    setSubmitted(true);
    
      setSubmitted(false);
      try {
        const { data } = await getByPatientAndDateAndStatus({
          patient: appointment.patient,
          timestamp: DateTime.fromISO(new Date(appointment.timestamp).toISOString()).toISO({ includeOffset: false }),
          status: 1, // estado atendido
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
        className="p-button-rounded p-button-warning"
        label='Ver Receta'
        onClick={() => onHandlerShowRecipe(rowData)}
      />
    </>
  );

  const onHandlerShowRecipe = async (appointment) => {
    try {
      const { data } = await getByAppointment(appointment.id);
      console.log('recipe', data);
      setShowPdfViewer(true);
      setAppointment(appointment)
      setRecipes(data);
      // toast.current.show({ severity: 'success', summary: 'Exito', detail: 'Se cancelo correctamente la cita', life: 5000 });
    } catch (error) {
      return toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ocurrio un error', life: 5000 });
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

  const MyDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}> 
          <View style={styles.section}>
            <Image
              style={styles.image}
              src="https://static.vecteezy.com/system/resources/previews/002/685/731/non_2x/medical-caduceus-symbol-design-illustration-eps-format-suitable-for-your-design-needs-logo-illustration-animation-etc-vector.jpg"
            />
            <Text style={styles.title}>Hospital Basico de la Zona El Oro</Text>
          </View>
          <View style={styles.section}>
            
            <Text style={styles.doctor}>{`${appointment.doctor?.name} ${appointment.doctor?.surname}`}</Text>
            <Text style={styles.doctor}>{`${appointment.specialty?.name}`}</Text>
            <Text style={styles.doctor}>{`Teléfono: ${appointment.doctor?.phone}`}</Text>
            
            <View style={styles.patientContainer}>
              <Text style={styles.patient}>Fecha:</Text>
              <Text style={styles.patient}>{new Date(appointment.timestamp).toLocaleDateString()}</Text>
              <Text style={styles.patient}>Nombre del Paciente:</Text>
              <Text style={styles.patient}>{`${appointment?.patient?.name} ${appointment?.patient?.surname}`}</Text>
            </View>

          </View>
        </View>
        <View style={styles.recipeContainer}>
          <Text style={styles.recipeTitle}>Receta:</Text>
          {recipes.map(recipe => {
            return (
              <div key={recipe.id.idMedicine} style={{ marginVertical: 10 }}>
                <Text>{`${recipe?.amount} - ${recipe?.medicine.name}`}</Text>
                <Text>{`${recipe?.prescription}`}</Text>
              </div>
            );
          })}
        </View>
      </Page>
    </Document>
  );

  return (
    <>
      <div className="shadow-2 surface-card p-4 border-round formgroup-inline">
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
          />
        </div>
        <Button label="Buscar" icon="pi pi-search" className="p-button-primary" onClick={getAppointments} />
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
      </DataTable>
      }
      <Toast ref={toast} />
      {showPdfViewer && <div className='mt-3' style={{ height: '100%' }}><PDFViewer style={styles.viewer}>{MyDoc()}</PDFViewer></div>}
    </>
  )
}

const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "100%",
  },
  page: {
    backgroundColor: 'white',
    width: '1024px',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
  },
  header: {
    flexDirection: 'row',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 24,
    marginVertical: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
    color: '#126EBF',
    textAlign: 'center',
    width: '200px',
  },
  doctor: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 3,
    color: '#126EBF',
    textAlign: 'right',
    width: '250px'
  },
  patient: {
    fontWeight: 900,
    fontSize: 18,
    marginVertical: 3,
    textAlign: 'right',
    width: '250px'
  },
  patientContainer: {
    marginVertical: 10,
  },
  recipeContainer: {
    margin: 25,
  },
  recipeTitle: {
    fontSize: 18,
    marginVertical: 20,
  },
});

export default Recipes;