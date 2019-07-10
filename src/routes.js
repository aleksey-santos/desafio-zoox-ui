import ListaEstados from './pages/Estado/Listar.vue'
import ListaCidades from './pages/Cidade/Listar.vue'


const routes = [
   { path:'/',name:'estado.lista',component: ListaEstados },
   { path:'/:estado?/cidades',name:'cidade.lista',component: ListaCidades },
]

export default routes;