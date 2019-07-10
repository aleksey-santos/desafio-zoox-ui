<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Desafio ZOOX - UI</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat block exact :to="{name:'estado.lista'}">Estados</v-btn>
        <v-btn flat block exact :to="{name:'cidade.lista'}">Cidades</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import Estados from './pages/Estado/Listar'
export default {
  name: 'App',
  components: {
    Estados
  },
  data () {
    return {
      //
    }
  }
}
</script>
