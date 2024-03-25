const { create } = require('domain')
const express = require('express')
const exphbs = require('express-handlebars')
const { json } = require('express/lib/response')
const fs = require('fs').promises
const path = require('path')

const app = express()

app.use(express.urlencoded({
  extended: true
}))

app.use(express.json())

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

app.use(express.static('public'))



app.get('/', async (req, res) =>{

  const experimento = await readJSON('registro.json')
  res.render('home', { experimento })
})

app.get('/experimento/:id', async (req, res) => {
  const id = req.params.id
  const json = await readJSON('registro.json')

  const data = await findData(json, id)
  res.render('details', { data })
})

app.post('/experimento/delete/:id', async (req, res) => {
  const id = req.params.id
  const json = await readJSON('registro.json')

  const newJSON = await removeData(json, id)
  await updateJSON(newJSON)
  res.redirect('/')
} )

app.get('/create', (req, res) => { 
  res.render('register')
})

app.post('/experimento/create', async (req, res) => {
  let id = req.body.id 
  id = await createId(id)

  const titulo = req.body.title 
  const descricao = req.body.description
  const area = req.body.area
  const autor = req.body.author
  const data = req.body.date

  const varName1 = req.body.varName
  const varDesc1 = req.body.varDesc

  const varName2 = req.body.varName2
  const varDesc2 = req.body.varDesc2  


  const variaveis = [ { nome: varName1, descricao: varDesc1 }, { nome: varName2, descricao: varDesc2 } ]
  const newExperiement = { id, titulo, descricao, area, autor, data, variaveis }

  const json = await readJSON('registro.json')
  json.push(newExperiement)
  updateJSON(json)
  res.redirect('/')
})


app.listen(3002, () => {
  console.log('>> server on')
})





function findData(data, id){
  return data.find((experimento) => {
    return experimento.id == id;
  });
}

function removeData(json, id){ 

  const item = json.findIndex(experimento => experimento.id == id)
  json.splice(item, 1)
  return json

}

async function createId(id){ 
  id = parseInt(id)
  const json = await readJSON('registro.json')
  for(el of json){ 
    if(id == el.id){
      ++id
      return createId(id)
    }
   
  };
  console.log('>> new id ' + id)
  return id
  }




async function readJSON(file) {
  const filePath = path.join(__dirname, 'json', file);// dirname pega a pasta e file pega o file
  const data = await fs.readFile(filePath, 'utf8') // podia estar dando readFileSync, mas fica mais clean assim
  return JSON.parse(data)
}

async function updateJSON(json) {
  try {
    const filePath = './json/registro.json';
    const jsonData = JSON.stringify(json, null, 2); // Formatar bonitinho no JSON, só estetica
    await fs.writeFile(filePath, jsonData);
    console.log('JSON atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar o arquivo JSON:', error);
  }
}

