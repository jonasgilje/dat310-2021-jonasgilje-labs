const mypageC = {
  data() {
    return {
      myReservations: null,
    };
  },
  methods: {
    updateUser: async function () {},
  },
  template: html`<div class="container" v-if="$root.loggedInUser">
    <h1>Hei, {{$root.loggedInUser.firstName}}</h1>
    <hr />
    <h2>Rediger bruker</h2>
    <loginpage
      class="px-0"
      :hide-login="true"
      :editing="$root.loggedInUser.id"
    ></loginpage>
    <hr />
    <h2>Rediger visningsfiltre</h2>
    <cabinfilters></cabinfilters>
    <button class="btn btn-primary my-3" @click="location.reload()">
      Lagre filtre
    </button>
    <hr />
    <h2>Se mine reservasjoner</h2>
    <router-link class="btn btn-primary mb-3" to="/myreservations">
      Gå til mine reservasjoner
    </router-link>
  </div>`,
};
