const express = require('express')
const exphbs = require('express-handlebars')
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

app.listen(3002, () => {
  console.log('>> Server on')
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

