const d = document;
const $table = d.querySelector('.crud-table');
const $form = d.querySelector('.crud-form');
const $title = d.querySelector('.crud-title');
const $loader = d.querySelector('.seccion-loader');
const $template = d.getElementById("crud-template").content;
const $fragment = d.createDocumentFragment();
const endPointSantos = 'http://localhost:3000/santos'

const doFetch = async (options) =>{
    if(typeof options !== 'object') console.warn('The parameter waited by the function doFetch must be an Object')
    let {url, method, success, error, data} = options
   $loader.style.display = "block";
    try {
        let res = await fetch(
                            url, {
                                method:method || 'GET',
                                headers: {"Content-Type":"application/json"}, //debe ser un OBJ
                                body: JSON.stringify(data) //data debe ser un OBJ
                                }
                            );
        let json = await res.json();
        if(!res.ok) throw res;
        success(json) //Ejecuion de la parte exitosa

    } catch (err) {
        let msj = err.statusText || "Ocurrio un error"
        error(`Error ${err.status}: ${msj}`) //Ejecuion dado un error
        console.log(err);
    }
    finally{
        $loader.style.display = "none";
    }
}

const printError = (msjError) => { 
    //!Esta funcion pinta en el DOM la info respuesta error del fetch()
    $table.insertAdjacentHTML("afterend",`<p><b>${msjError}</b></p>`) 
}

const printSuccess = (json) =>{
    //!Esta funcion le da contenido a las tags templetes del DOM (info respuesta exitosa del fetch()) pintandolas
    //!ademas crea datasets a cada botones por registro, para que a su onClick sepan que elemento borar o editar.
    json.map(e =>{
        $template.querySelector('.name').textContent = e.nombre;
        $template.querySelector('.constellation').textContent = e.constelacion;
        
        $template.querySelector('.edit').dataset.id = e.id;
        $template.querySelector('.edit').dataset.name = e.nombre;
        $template.querySelector('.edit').dataset.constellation = e.constelacion;
        $template.querySelector('.delete').dataset.id = e.id;

        const $clone = d.importNode($template, true);
        $fragment.appendChild($clone);
    })
    $table.querySelector('tbody').appendChild($fragment)
}

d.addEventListener('DOMContentLoaded', () =>{
    //!Esta funcion a la carga del DOM, llama al fetch(GET ALL)
    const optionsData = {
        url:endPointSantos,
        success:(json) => printSuccess(json), 
        error: (err) => printError(err)
    }
    doFetch(optionsData)
    
})

d.addEventListener('submit', (e) =>{
    //!Esta funcion al enviar el formulario, determina si es un POST o PUT llama al fetch()
    const listenForm = e.target;
    if(listenForm === $form) {
        const idRegistro = listenForm.id.value; //proviene de input hidden name="id" del <form

        e.preventDefault(); //dado que e.target es un <form
       
        //!OBJ Opciones del fetch() para POST o PUT
        const optionsData = {
            url:endPointSantos,
            method:'POST',
            success:(json) => location.reload(), 
            error: (err) => printError(err),
            data:{
                //accedo al value escrito por usuario, a cada input a traves del nombre de la var dada (attb name)
                //Cuyo valor lo asigno a las key, del objeto body que debe ser enviado al servidor como data.
                //en doFetch() esta data se hace JSON.stringify()
                nombre: listenForm.nombre.value, 
                constelacion: listenForm.constelacion.value
            }
        }
    
        //!POST, el <form NO tiene name="id"
        if(!idRegistro) doFetch(optionsData)
        //!PUT, <form TIENE name="id". Modificamos un poco el OBJ Opciones.
        else doFetch({...optionsData, method:'PUT', url:`${endPointSantos}/${idRegistro}`})
    }
})

d.addEventListener('click', (e) =>{
    const listenButtons = e.target

    if(listenButtons.matches('.edit')){
        //!Al click del boton "edict" damos valor y a las cajitas de los inputs, 
        //!con el valor de cada registro. El boton oyente tiene los valores en datasets 
        $title.textContent = 'Editando Santos';
        $form.nombre.value = listenButtons.dataset.name
        $form.constelacion.value = listenButtons.dataset.constellation
        $form.id.value = listenButtons.dataset.id
    }
    
    //!DELETE
    if(listenButtons.matches('.delete')){
    //!Al click del boton "delete" (q tiene el valor del id en un dataset), llama al fetch(DELETE)
        const id = listenButtons.dataset.id; //Con dataset no necesito "value" como si para acceder al value de los name
        const isDelete = confirm(`Deseas eliminar el registro ${id}`)
        if(isDelete) doFetch({ url:`${endPointSantos}/${id}`, method:'DELETE'})
    }
})
