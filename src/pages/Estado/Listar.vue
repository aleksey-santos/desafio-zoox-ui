<template>
  <v-container>
    <v-toolbar class="elevation-2" flat color="white">
      <v-toolbar-title>Estados</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="textoBusca"
        append-icon="search"
        label="Filtrar"
        single-line
        hide-details
      ></v-text-field>

      <v-dialog v-model="formAberto" max-width="500px">
        <template v-slot:activator="{ formAberto }">
          <v-btn color="primary" @click="novo" dark class="mb-2" v-on="formAberto">Cadastrar Estado</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ estado.id?'Editando Estado':'Novo Estado' }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-form v-model="valido" class="flex xs12" ref="form">
                <v-flex xs12>
                  <v-text-field validate-on-blur hint="Nome do Estado" :rules="[validacao.obrigatorio]" v-model="estado.nome" label="Nome"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field validate-on-blur hint="Ex. RJ,SP" v-model="estado.abreviacao" :rules="[validacao.obrigatorio]" label="Abreviação"></v-text-field>
                </v-flex>
                </v-form>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="fechar">Cancelar</v-btn>
            <v-btn color="blue darken-1" flat @click="salvar">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-toolbar>

    <v-data-table :search="textoBusca" style="margin-top:10px" class="elevation-2" :headers="headers" :items="registros">
    <template v-slot:items="props">
      <td class="text-xs-center">{{ props.item.nome }}</td>
      <td class="text-xs-center">{{ props.item.abreviacao }}</td>
      <td class="text-xs-center">{{ formataData(props.item.data_cricacao) }}</td>
      <td class="text-xs-center">{{ formataData(props.item.data_ultima_alteracao) }}</td>
      <td class="text-xs-center">
        <v-icon medium class="mr-2 icone-acao-listar" @click="editar(props.item)">edit</v-icon>
        <v-icon medium class="mr-2 icone-acao-listar" @click="listarCidades(props.item.id)">location_city</v-icon>
        <v-icon medium class="mr-2 icone-acao-listar" @click="excluir(props.item)">delete</v-icon>
      </td>
    </template>
    <template v-slot:no-results>
        Nenhum resultado para o filtro: <span style="font-weight:bold">{{ textoBusca }}</span>.
    </template>
    </v-data-table>
    <v-snackbar bottom right :color="alerta.cor" :timeout="2000" :value="alerta.status">
        {{ alerta.mensagem }}
    </v-snackbar>
  </v-container>
</template>
<script>
import moment from 'moment';
import { setTimeout } from 'timers';

  export default {
    data: () => ({
        registros:[],
        headers:[
            {
                text:'Nome',
                align:'center',
                sortable:true,
                value:'nome'
            },
            {
                text:'Abreviação',
                align:'center',
                sortable:'true',
                value:'abreviacao'
            },
            {
                text:'Data de Criação',
                align:'center',
                sortable:'true',
                value:'data_cricacao'
            },
            {
                text:'Ultima Alteração',
                align:'center',
                sortable:'true',
                value:'data_ultima_alteracao'
            },
            {
                text:'Ações',
                align:'center',
                sortable:false
            }
        ],
        validacao:{
          obrigatorio: value => !!value || 'Campo Obrigatório'
        },
        estado: {},
        formAberto: false,
        valido:true,
        alerta:{
            status:false,
            mensagem:'',
            cor:'success'
        },
        textoBusca:''
        
    }),
    methods:{
      listarCidades(id){
        this.$router.push({name:'cidade.lista',params:{estado:id}});
      },
        flashAlerta(mensagem,cor){
            this.alerta.mensagem = mensagem;
            this.alerta.cor = cor;
            this.alerta.status = true;
        },
        formataData(data){
            return moment(data).format('DD[/]MM[/]YYYY HH[:]mm[:]ss')
        },
        novo(){
            this.$refs.form.reset();
            this.estado = {},
            this.formAberto = true;
        },
        editar(item){
            this.$refs.form.reset();
            this.estado = Object.assign({},item);
            this.formAberto = true;
        },
        async salvar(){
          this.$refs.form.validate();
            if(!this.valido){
              return false;
            }
            
            let result;
            try{
                if(this.estado.id){
                    result = await this.$axios.put('estado/'+this.estado.id,this.estado);
                }else{
                    result = await this.$axios.post('estado',this.estado);
                }
            }catch(ex){
                this.flashAlerta('Erro ao salvar o estado!','error');
                this.fechar();
                return;
            }
            this.estado = {};
            if(result.data.error){
                this.flashAlerta('Erro ao salvar o estado!','error');
                this.fechar();
            }else{
                this.flashAlerta('Estado salvo com sucesso!','success');
                await this.carregarItens();
                this.fechar();
            }
        },
        async excluir(item){
            let resultado;
            if(!confirm('Tem certeza que deseja excluir este estado?')){
                return false;
            }
            try{
                resultado = await this.$axios.delete('estado/'+item.id);
            }catch(ex){
                this.flashAlerta('Erro ao excluir o estado!','error');
            }
            if(resultado.status == 200){
                this.flashAlerta('Estado excluido com sucesso!','success');
                this.carregarItens();
            }
        },
        fechar(){
            this.formAberto = false;
            setTimeout(() => {
                this.$refs.form.reset();
                this.estado = {};
            },500);
        },
        async carregarItens(){
            try{
                let req = await this.$axios.get('estado');
                if(req.data.error == false){
                    this.registros = req.data.data;
                }
            }catch(ex){
                this.flashAlerta('Erro ao carregar itens!','error');
            }
        }
    },
    async created(){
        moment.locale('pt-br');
        await this.carregarItens();
    }
  }
</script>

<style>

</style>
