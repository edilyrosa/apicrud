const d = document;
const $table = d.querySelector('.crud-table');
const $form = d.querySelector('.crud-form');
const $title = d.querySelector('.crud-title');
const $loader = d.querySelector('.seccion-loader');
const $template = d.getElementById("crud-template").content;
const $fragment = d.createDocumentFragment();
const endPointSantos = 'http://localhost:3000/santos'

const printError = (err) => { 
    //!Esta funcion pinta en el DOM la info respuesta error del fetch()
    let msjError = err.response.statusText || "Ocurrio un error"
    $table.insertAdjacentHTML("afterend",`<p><b>Error ${err.response.status}: ${msjError}</b></p>`) 
}
const getAll = async () =>{
    $loader.style.display = "block";
    try {
        let res = await axios.get(endPointSantos)
        let json = await res.data

        //throw res, no es necesario, axios manupula el error

        //!Damos contenido a las tags templetes del DOM con la res, pintandolas
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
        
    } catch (err) {
         //!Pinta en el DOM la info res error del fetch()
        console.log(err.response); 
        printError(err)

    }finally{
        $loader.style.display = "none";
    }
}

d.addEventListener('DOMContentLoaded', () =>{
    //!Esta funcion a la carga del DOM, llama al fetch(GET ALL)
    getAll()
})

d.addEventListener('submit', async (e) =>{

    //!Esta funcion al enviar el formulario, determina si es un POST o PUT llama al fetch()
    const listenForm = e.target;
    if(listenForm === $form) {
        const idRegistro = listenForm.id.value; //proviene de input hidden name="id" del <form
        e.preventDefault(); //dado que e.target es un <form
       
        //!OBJ Opciones del fetch() para POST o PUT
        const optionsAxios = {
            method:'POST',
            headers: {"Content-Type":"application/json"},
            data:JSON.stringify({ //!en vez de body se llama "data" en axios
                //accedo al value escrito por usuario, a cada input a traves del nombre de la var dada (attb name)
                //Cuyo valor lo asigno a las key, del objeto body que debe ser enviado al servidor como data.
                nombre: listenForm.nombre.value, 
                constelacion: listenForm.constelacion.value
            })
        }

        //!POST, el <form NO tiene name="id"
        if(!idRegistro) {
            $loader.style.display = "block";
            try {
                const res = await axios(endPointSantos, optionsAxios) //El OBJ senala el method, por eso el simplemente axios()
                const json = await res.data; //todo NO SE SI ESTO ES NECESARIO
                location.reload()
            } catch (err) {
                printError(err)
            
            }finally{
                $loader.style.display = "none";
            }
        }
        
        //!PUT, <form TIENE name="id". Modificamos un poco el OBJ Opciones.
        else {
            $loader.style.display = "block";
            try {
                axios(`${endPointSantos}/${idRegistro}`, {...optionsAxios, method:'PUT'}) //El OBJ senala el method, por eso el simplemente axios()
                const json = await res.data; //todo NO SE SI ESTO ES NECESARIO
                location.reload()
            } catch (err) {
                printError(err)
            
            }finally{
                $loader.style.display = "none";
            }
        } 
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
        $form.id.value = listenButtons.dataset.id //Bandera, si existe sera hara un "PUT"
    }
    
    //!DELETE
    if(listenButtons.matches('.delete')){
    //!Al click del boton "delete" (q tiene el valor del id en un dataset), llama al fetch(DELETE)
        const id = listenButtons.dataset.id; //Con dataset no necesito "value" como si para acceder al value de los name
        const isDelete = confirm(`Deseas eliminar el registro ${id}`)
        if(isDelete) {
            $loader.style.display = "block";
            try {
                axios({ url:`${endPointSantos}/${id}`, method:'DELETE'})
                location.reload();
            } catch (err) {
                printError(err)
            
            }finally{
                $loader.style.display = "none";
            }
        }
    }
})
