const d = document;
const $SeccionAll = d.querySelector('.crud');
const $table = d.querySelector('.crud-table');
const $form = d.querySelector('.crud-form');
const $title = d.querySelector('.crud-title');
const $loader = d.querySelector('.seccion-loader');
const $msj = d.querySelector('.msj');
const $template = d.getElementById("crud-template").content;
const $fragment = d.createDocumentFragment();
const endPointSantos = 'http://localhost:3000/santos'
const printError = (err) => { 
    //!Error function that prints on the DOM the info response error of axios()
    let msjError = err.response.statusText || " An error has occurred"
    $msj.style.display = "block";
    $msj.textContent = `Error ${err.response.status}: ${msjError}`
    $SeccionAll.style.display = "none"
}

const doAxios = async (url, options) =>{
    const {method, data, success, headers} = options
    if(typeof options !== 'object') console.warn('The parameter waited by the function doFetch must be an Object')
    $loader.style.display = "block"; //Show the loader
    try {
        let res = await axios(url, options)
        let json = await res.data
        //throw res, isn't necessary, axios handle the error
        success(json)
        $table.querySelector('tbody').appendChild($fragment)
    } catch (err) {
        printError(err)
    }finally{
        $loader.style.display = "none"; //Hide the loader
    }
}
const getAll = () =>{
    //!OBJ Options of axios() for GET
    const optionsAxios = {
        method:'GET',
        headers: {"Content-Type":"application/json"},
        success: (json) => {
            if(json.length < 1) {
                $msj.style.display = "block";
                $msj.textContent = "There isn't Data"
                $SeccionAll.style.display = "none"
                $msj.style.backgroundColor = "#19bcce"
               
                //$table.insertAdjacentHTML("afterend",`<p><b>There isn't Data</b></p>`) 
            }
            //!Damos contenido a las tags templetes del DOM con la res, pintandolas
            //!ademas crea datasets a cada botones por registro, para que a su onClick sepan que elemento borar o editar.
            json.map(e =>{
                $template.querySelector('.nameEn').textContent = e.name;
                $template.querySelector('.emailEn').textContent = e.email;
                //$template.querySelector('.imgEn').src = "https://placeimg.com/100/50/animals";
                $template.querySelector('.imgEn').src = "https://placekitten.com/100/60";
                
                $template.querySelector('.edit').dataset.id = e.id;
                $template.querySelector('.edit').dataset.nameEn = e.nombre;
                $template.querySelector('.edit').dataset.emailEn = e.email;
                $template.querySelector('.delete').dataset.id = e.id;
        
                const $clone = d.importNode($template, true);
                $fragment.appendChild($clone);
            })
            $table.querySelector('tbody').appendChild($fragment)

        }
    }
    doAxios(endPointSantos, optionsAxios)
}

d.addEventListener('DOMContentLoaded', () =>{
    //!This function loads on the DOM all the info from axios(GET ALL)
    getAll()
})

d.addEventListener('submit', async (e) =>{

    //!This function sends the form to the API REST. Determining if is POST or PUT through the existence of the id
    const listenForm = e.target;
    if(listenForm === $form) {
        const idRegistro = listenForm.id.value; //From of input hidden name="id"
        e.preventDefault(); //Due to e.target is <form
       
        //!OBJ Options of axios() for POST & PUT
        const optionsAxios = {
            method:'POST',
            headers: {"Content-Type":"application/json"},
            data:JSON.stringify({ //!instead of being called "body" is "data" in axios
                //Get every value written by user on the inputs through (attb name) and set them to the body send it to the server.
                name: listenForm.name.value, 
                email: listenForm.email.value

            })
        }

        //!POST, <form doesn't have name="id"
        if(!idRegistro) doAxios(endPointSantos, optionsAxios)
        
        //!PUT, <form has name="id". Change a litle bit the OBJ Options.
        else doAxios(`${endPointSantos}/${idRegistro}`, {...optionsAxios, method:'PUT'}) //El OBJ senala el method, por eso el simplemente axios()
                
    }
})

d.addEventListener('click', (e) =>{
    const listenButtons = e.target

    if(listenButtons.matches('.edit')){
        //!clicking on "edict" buttons we give values to the inputs from every record, 
        //!Every listener button has the values on datasets.
        $title.textContent = 'Editing Record';
        $form.name.value = listenButtons.dataset.nameEn
        $form.email.value = listenButtons.dataset.emailEn
        $form.id.value = listenButtons.dataset.id //Flag, if it does exist it will do "PUT"
    }
    
    //!DELETE
    if(listenButtons.matches('.delete')){
    //!clicking on "delete" buttons (it has the id value on its dataset), call doAxios(DELETE)
        const id = listenButtons.dataset.id; 
        const isDelete = confirm(`Do you want delete record # ${id}`)
        if(isDelete) {
            doAxios(`${endPointSantos}/${id}`, {method:'DELETE'})
            location.reload();
        }
    }
})
