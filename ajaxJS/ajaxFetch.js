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

const printError = (msjError) => { 
    //!Error function that prints on the DOM the info response error of fetch()
    let msjError = err.response.statusText || " An error has occurred"
    $msj.style.display = "block";
    $msj.textContent = `Error ${err.response.status}: ${msjError}`
    $SeccionAll.style.display = "none"
}

const doFetch = async (options) =>{
    if(typeof options !== 'object') console.warn('The parameter waited by the function doFetch must be an Object')
    let {url, method, success, error, data} = options
   $loader.style.display = "block";
    try {
        let res = await fetch(
                            url, {
                                method:method || 'GET',
                                //headers & body must be Objects
                                headers: {"Content-Type":"application/json"}, 
                                body: JSON.stringify(data) 
                                }
                            );
        let json = await res.json();
        if(!res.ok) throw res; //Error Handle 
        success(json) 

    } catch (err) {
        printError(err)
    }
    finally{
        $loader.style.display = "none";
    }
}

const printSuccess = (json) =>{
        if(json.length < 1) {
            $msj.style.display = "block";
            $msj.textContent = "There isn't Data"
            $SeccionAll.style.display = "none"
            $msj.style.backgroundColor = "#19bcce"
           
            //$table.insertAdjacentHTML("afterend",`<p><b>There isn't Data</b></p>`) 
        }
        //!Giving content to the tmeplets tags of DOM with the response, print it.
        //!Creating datasets for every button, which onClick get the register to edit or delete.
        json.map(e =>{
            $template.querySelector('.nameEn').textContent = e.name;
            $template.querySelector('.emailEn').textContent = e.email;
            //$template.querySelector('.imgEn').src = "https://placeimg.com/100/50/animals";
            $template.querySelector('.imgEn').src = "https://placekitten.com/100/60";
            
            $template.querySelector('.edit').dataset.id = e.id;
            $template.querySelector('.edit').dataset.nameEn = e.name;
            $template.querySelector('.edit').dataset.emailEn = e.email;
            $template.querySelector('.delete').dataset.id = e.id;
    
            const $clone = d.importNode($template, true);
            $fragment.appendChild($clone);
        })
        $table.querySelector('tbody').appendChild($fragment)
}

d.addEventListener('DOMContentLoaded', () =>{
    //!This function loads on the DOM all the records from fetch(GET ALL)
    const optionsData = {
        url:endPointSantos,
        success:(json) => printSuccess(json), 
        error: (err) => printError(err)
    }
    doFetch(optionsData)
    
})

d.addEventListener('submit', (e) =>{
     //!This function sends the data's form to the API REST. Determining if is POST or PUT through the existence of the id
    const listenForm = e.target;
    if(listenForm === $form) {
        const idRegistro = listenForm.id.value; //proviene de input hidden name="id" del <form

        e.preventDefault(); //dado que e.target es un <form
       
          //!OBJ Options of fetch() for POST & PUT
        const optionsData = {
            url:endPointSantos,
            method:'POST',
            success:(json) => location.reload(), 
            error: (err) => printError(err),
            data:{
                //Get every value written by user on the inputs through (attb name) and set them to the body send it to the server.
                //On doFetch() -> JSON.stringify(this data)
                name: listenForm.name.value, 
                email: listenForm.email.value
            }
        }
    
        //!POST, <form doesn't have name="id"
        if(!idRegistro) doFetch(optionsData)
        //!PUT, <form has name="id". Change a litle bit the OBJ Options.
        else doFetch({...optionsData, method:'PUT', url:`${endPointSantos}/${idRegistro}`})
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
            doFetch({ url:`${endPointSantos}/${id}`, method:'DELETE'})
            ocation.reload();
        }
    }
})
