<template>
  <v-container>
    <v-toolbar class="elevation-2" flat color="white">
      <v-toolbar-title>Cidades</v-toolbar-title>
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
          <v-btn color="primary" @click="novo" dark class="mb-2" v-on="formAberto">Cadastrar Cidade</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ cidade.id?'Editando Cidade':'Nova Cidade' }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-form v-model="valido" class="flex xs12" ref="form">
                <v-flex xs12>
                  <v-text-field validate-on-blur hint="Nome da Cidade" :rules="[validacao.obrigatorio]" v-model="cidade.nome" label="Nome"></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-select hint="Estado da Cidade" :rules="[validacao.obrigatorio]" v-model="cidade.estado" item-text="nome" item-value="id" :items="listaEstados" label="Estado"  />
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
      <td class="text-xs-center">{{ props.item.estado.nome }}</td>
      <td class="text-xs-center">{{ formataData(props.item.data_cricacao) }}</td>
      <td class="text-xs-center">{{ formataData(props.item.data_ultima_alteracao) }}</td>
      <td class="text-xs-center">
        <v-icon medium class="mr-2 icone-acao-listar" @click="editar(props.item)">edit</v-icon>
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
        listaEstados: [],
        registros:[],
        headers:[
            {
                text:'Nome',
                align:'center',
                sortable:true,
                value:'nome'
            },
            {
                text:'Estado',
                align:'center',
                sortable:'true',
                value:'estado'
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
        cidade: {
        },
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
      async carregaListaEstados(){
        let resposta;
        try{
          resposta = await this.$axios.get('/estado');
          this.listaEstados = resposta.data.data;
        }catch(ex){
          console.log(ex);
          this.flashAlerta('Erro ao carregar a lista de estados','error');
        }
        
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
            this.cidade = {};
            if(this.$route.params.estado){
              this.cidade.estado = this.$route.params.estado;
            }
            this.formAberto = true;
        },
        editar(item){
            this.$refs.form.reset();
            this.cidade = Object.assign({},item);
            this.formAberto = true;
        },
        async salvar(){
          this.$refs.form.validate();
            if(!this.valido){
              return false;
            }
            let dados = Object.assign({},this.cidade);
            let result;
            try{
                if(this.cidade.id){
                    result = await this.$axios.put('cidade/'+this.cidade.id,dados);
                }else{
                    result = await this.$axios.post('cidade',dados);
                }
            }catch(ex){
                this.flashAlerta('Erro ao salvar o cidade!','error');
                this.fechar();
                return;
            }
            this.cidade = {};
            if(result.data.error){
                this.flashAlerta('Erro ao salvar o cidade!','error');
                this.fechar();
            }else{
                this.flashAlerta('Cidade salva com sucesso!','success');
                await this.carregarItens();
                this.fechar();
            }
        },
        async excluir(item){
            let resultado;
            if(!confirm('Tem certeza que deseja excluir esta cidade?')){
                return false;
            }
            try{
                resultado = await this.$axios.delete('cidade/'+item.id);
            }catch(ex){
                this.flashAlerta('Erro ao excluir a cidade!','error');
            }
            if(resultado.status == 200){
                this.flashAlerta('Cidade excluida com sucesso!','success');
                this.carregarItens();
            }
        },
        fechar(){
            this.formAberto = false;
            setTimeout(() => {
                this.$refs.form.reset();
                this.cidade = {};
            },500);
        },
        async carregarItens(){
            try{
              let query;
                if(this.$route.params.estado){
                  query = {
                    estado:this.$route.params.estado
                  }
                }
                let req = await this.$axios.get('cidade',{params: query});
                if(req.data.error == false){
                    this.registros = req.data.data;
                }
            }catch(ex){
              console.log(ex);
              this.flashAlerta('Erro ao carregar itens!','error');
            }
        }
    },
    async created(){
        moment.locale('pt-br');
        await this.carregarItens();
        await this.carregaListaEstados();
    }
  }
</script>

<style>

</style>
