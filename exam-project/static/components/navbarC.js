const navbarC = {
  data() {
    return {
      luckyChoices: [],
      luckyLink: "/",
    };
  },
  created: async function () {
    let response = await fetch("/api/lucky");
    if (response.ok) {
      let result = await response.json();
      this.luckyChoices = result;
    }
    this.updateLuckyLink();
  },
  methods: {
    updateLuckyLink: function () {
      if (this.luckyChoices.length < 2) {
        this.luckyLink = "/";
        return;
      }
      let newLink = "/";
      do {
        const chosenOne =
          this.luckyChoices[
            Math.floor(Math.random() * this.luckyChoices.length)
          ];
        newLink = "/cabininfo/" + chosenOne;
      } while (newLink === this.luckyLink);
      this.luckyLink = newLink;
    },
    logOut: async function () {
      this.$root.loggedInUser = null;
      await fetch("/api/logout", { method: "POST" });
      this.$router.push({ name: "index" }, () => {});
    },
  },
  template: html`
    <!-- navbar inspired by bootstrap documentation -->
    <nav class="navbar navbar-expand-md navbar-light bg-light mb-3">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">Stølsbooking</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/home"> Hjem </router-link>
            </li>
            <li class="nav-item" v-if="$root.loggedInUser">
              <router-link class="nav-link" to="/myreservations">
                Mine reservasjoner
              </router-link>
            </li>
            <li class="nav-item" @click="updateLuckyLink()">
              <router-link class="nav-link" :to="luckyLink">
                I'm feeling lucky
              </router-link>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" v-if="$root.loggedInUser?.isAdmin">
              <router-link class="nav-link" to="/adminpage"
                ><strong style="color:red;"> Admin </strong></router-link
              >
            </li>
            <li class="nav-item" v-if="$root.loggedInUser">
              <router-link class="nav-link" to="/mypage">
                Min side
              </router-link>
            </li>
            <li class="nav-item" v-else>
              <router-link class="nav-link" to="/login"> Logg inn </router-link>
            </li>
            <li class="nav-item" v-if="$root.loggedInUser">
              <a class="nav-link" @click="logOut()" href="#"> Logg ut </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
};
