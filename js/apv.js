//Variables
let DB;
let edition = false;
    //Inputs
const iName =  document.querySelector('#mascota');
const iOwner = document.querySelector('#propietario');
const iCellphone = document.querySelector('#telefono');
const iDate = document.querySelector('#fecha');
const iHour = document.querySelector('#hora');
const iSymptom = document.querySelector('#sintomas');
const sButton = document.querySelector('#submit');

    //Forms
const form = document.querySelector('#nueva-cita');

    //Contenedor de citas
const date_container = document.querySelector('#citas');

//-----------------------------------------------------------
//Class
class Dates{
    constructor(){
        this.dateList = [];
        this.editList = [];
    }

    validateDate(event){
        event.preventDefault();
        const {mascota, propietario, telefono, fecha, hora , sintomas} = dateObj;

        if (mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora==='' || sintomas === '') {
            ui.showMessage('Todos los campos son Obligatorios','error');
            return;
        }
       
        if (mascota.length > 10  || propietario.length > 10  || telefono.length > 10 ) {
            ui.showMessage('No puedes exceder los 10 caracteres','error');
            return;
        }

        if (edition === true) {     
            adminDate.dateList = adminDate.dateList.map( date=> date.id === dateObj.id ? {...dateObj} : date);
            //adminDate.addDate('');

            const transaction = DB.transaction(['dates'],'readwrite');
            const objectStore = transaction.objectStore('dates');

            objectStore.put(dateObj);

            transaction.oncomplete = function(){
                form.querySelector('button[type = "submit"]').textContent = 'Crear Cita';
                ui.showMessage('Cambios Guardados ','success');
                edition = false;
                form.reset();
                cleanObject(dateObj);
                ui.printDates();
            }

            

        }else{
            
            dateObj.id = Date.now(); // Añadimos un id para actualizar o eliminar.
            adminDate.addDate({...dateObj}); // {...dateObj} envia una copia del objeto, esto evita que se envien valores duplicados

            //Create Transaction
            const transaction = DB.transaction(['dates'], 'readwrite');

            //Create Object Store
            const objectStore = transaction.objectStore('dates');

            //Insertar
            objectStore.add(dateObj);

            transaction.oncomplete = function(){
                ui.showMessage('Cita Añadida','success');
                cleanObject(dateObj);
                ui.printDates();
            }
        }
    }

    addDate(date){//not necessary 
        if (date==='') {
            
        }else{
            this.dateList = [...this.dateList, date]; //Agregar nuevas citas al arreglo de citas
        }
        form.reset(); //Reinicar los campos del form
    }

    updateDate(date){
        console.log(date);
        edition = true;
        const { mascota, propietario, telefono, fecha, hora, sintomas, id} = date;
        iName.value = mascota;
        iOwner.value = propietario;
        iCellphone.value = telefono;
        iDate.value = fecha;
        iHour.value = hora;
        iSymptom.value = sintomas;

        //Añadir los elementos al objeto global
        dateObj.mascota = mascota;
        dateObj.propietario = propietario;
        dateObj.telefono = telefono;
        dateObj.fecha = fecha;
        dateObj.hora = hora;
        dateObj.sintomas = sintomas;
        dateObj.id = id;
        //console.log(dateObj);

        form.querySelector('button[type = "submit"]').textContent = 'Guardar Cambios';
        
    }

    removeDate(id){
        console.log(id)
        const transaction = DB.transaction(['dates'],'readwrite');
        const objectStore = transaction.objectStore('dates');
        objectStore.delete(id);
        transaction.oncomplete = function(){
            ui.printDates();
        }
    }

}

class UI{

    showMessage(message,type){
        const p = document.createElement('p');
        p.classList.add('text-center', 'alert', 'd-block', 'col-12');
        if (type==='error') {
            p.classList.add('alert-danger');
        }else{
            p.classList.add('alert-success');
        }
        //add message
        p.textContent = message;
        //add to html
        document.querySelector('#contenido').insertBefore(p, document.querySelector('.agregar-cita'));

        setTimeout(() => {
            p.remove();
        }, 3000);
    }

    printDates(){
        UI.deleteHTML();
        const objectStore = DB.transaction('dates').objectStore('dates');

        objectStore.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;

            if (cursor) {
                const {mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;

                const divDate = document.createElement('div'); //En el div van todos los datos del form
                divDate.classList.add('cita', 'p-3');
                //divDate.dataset.id = id; // añaidr atributa id = id de cada elemento

                const editButton = document.createElement('button');//Edit button
                editButton.classList.add('btn','btn-success');
                editButton.textContent = 'Editar';
                const value = e.target.result.value;
                editButton.onclick = () => adminDate.updateDate(value);

                const deleteButton = document.createElement('button');//Delete button 
                deleteButton.classList.add('btn','btn-danger','mr-2');
                deleteButton.textContent = 'Eliminar';
                deleteButton.onclick = () => { adminDate.removeDate(id) }

                const p_mascota = document.createElement('h2');
                p_mascota.classList.add('card-title', 'font-weight-bolder');
                p_mascota.textContent = mascota;

                const p_element = document.createElement('p');
                p_element.innerHTML = `
                <span class= "font-weight-bolder">Propietario: </span>${propietario} <br>
                
                <span class= "font-weight-bolder">Telefono: </span>${telefono}<br>
                
                <span class= "font-weight-bolder">Fecha: </span>${fecha} -- ${hora}<br>
                
                <span class= "font-weight-bolder">Sintomas: </span>${sintomas}<br>
                `;

                //Agregar elementos al div
                divDate.appendChild(p_mascota);
                divDate.appendChild(p_element);
                divDate.appendChild(deleteButton);
                divDate.appendChild(editButton);

                //Añadir div al html
                date_container.appendChild(divDate);

                cursor.continue();
            }   
            
        };
    }
    static deleteHTML(){
        while(date_container.firstChild){
            date_container.removeChild(date_container.firstChild);
        }
    }
}


//Initialize
const ui = new UI();
const adminDate = new Dates();


//Events
eventListener();
function eventListener() {
    document.addEventListener('DOMContentLoaded', () => {
        form.reset();
        createDB();
    });

    iName.addEventListener('input', dataDate);
    iOwner.addEventListener('input', dataDate);
    iCellphone.addEventListener('input', dataDate);
    iDate.addEventListener('input', dataDate);
    iHour.addEventListener('input', dataDate);
    iSymptom.addEventListener('input', dataDate);

    form.addEventListener('submit', adminDate.validateDate);
}

//Obj
const dateObj = {
    mascota: '',
    propietario: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: '',
}

//Functions
function cleanObject(date) {
    date.mascota = '';
    date.propietario = '';
    date.telefono = '';
    date.fecha = '';
    date.hora = '';
    date.sintomas = '';
}

function dataDate(element) { //Load data in dateObj
    dateObj[element.target.name] = element.target.value;
}

function createDB() {
    const createDB = window.indexedDB.open('dates',1.1);

    createDB.onerror = function(){
        console.log('Error al crear la BD');
    }
    createDB.onsuccess = function (){
        //console.log('BD creada correctamente');
        DB = createDB.result;
        ui.printDates();
    }

    createDB.onupgradeneeded = function (e){
        const db  = e.target.result;

        const objectStore = db.createObjectStore( 'dates', {
            keyPath: 'id',
            autoincrement: true,
        });

        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('propietario', 'propietario', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});

        console.log('DB created');
    }
}