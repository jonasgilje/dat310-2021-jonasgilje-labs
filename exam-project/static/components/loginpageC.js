const loginpageC = {
  data() {
    return {
      username: null,
      password: null,
      newUsername: null,
      newFullName: null,
      newFirstName: null,
      newLastName: null,
      newTelephone: null,
      newPassword1: "",
      newPassword2: "",
      alertMessage: null,
      loginAlertObject: null,
      msg: "",
      pwRegex: /^\S{8,}$/,
    };
  },
  props: {
    "hide-login": {
      type: Boolean,
      default: false,
    },
    editing: {
      type: Number,
      default: null,
    },
  },
  watch: {
    editing: {
      immediate: true,
      handler: async function (value) {
        if (value == null) return;
        let response = await fetch(`/api/user/${value}`);
        if (response.ok) {
          const [user] = await response.json();
          if (user == null) {
            this.msg = `Bruker med ID ${value} finnes ikke`;
            this.newFirstName = "";
            this.newLastName = "";
            this.newUsername = "";
            this.newTelephone = "";
            return;
          }
          this.msg = "";
          this.newFirstName = user.firstName;
          this.newLastName = user.lastName;
          this.newUsername = user.email;
          this.newTelephone = user.telephone;
        }
      },
    },
  },
  methods: {
    sendLoginForm: async function () {
      const username = this.username,
        password = this.password;
      let response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.status === 200) {
        const user = await response.json();
        this.$root.loggedInUser = user;
        // redirect home
        this.$router.push({ name: "home" });
      } else {
        clearTimeout(this.loginAlertTimeout);
        this.loginAlertObject = {
          type: "alert-danger",
          text: "Innlogging feilet. Sjekk at brukernavn og passord er skrevet riktig inn.",
        };
        this.loginAlertTimeout = setTimeout(() => {
          this.loginAlertObject = null;
        }, 3000);
      }
    },
    sendNewUserForm: async function () {
      // hvis det sendes ny form før timeouten har rukket å tilbakestille suksessmeldingene
      this.alertMessage = null;
      this.newUserSuccess = false;
      this.editUserSuccess = false;
      this.editUserConflict = false;
      // har allerede warning for ulike passord.
      if (this.newPassword1 !== this.newPassword2) return;
      if (this.newPassword1?.match(this.pwRegex) == null) return;

      let lastSpace = this.newFullName?.lastIndexOf(" ");
      if (lastSpace === -1) lastSpace = this.newFullName.length;
      const firstName =
          this.newFirstName ?? this.newFullName?.slice(0, lastSpace ?? 0),
        lastName =
          this.newLastName ??
          this.newFullName?.slice(lastSpace + 1, this.newFullName.length);
      let response = await fetch(
        `/api/user${this.editing ? "/" + this.editing : ""}`,
        {
          method: this.editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            telephone: this.newTelephone,
            email: this.newUsername,
            password: this.newPassword1,
          }),
        }
      );
      if (response.status === 201) {
        this.newUsername = null;
        this.newFullName = null;
        this.newTelephone = null;
        this.newPassword1 = "";
        this.newPassword2 = "";
        clearTimeout(this.resetTimeout);
        this.alertMessage = {
          type: "alert-success",
          text: "Ny bruker opprettet. Du kan nå logge inn.",
        };
        this.resetTimeout = setTimeout(() => {
          this.alertMessage = null;
        }, 3000);
      } else if (response.status === 200 && this.editing) {
        clearTimeout(this.resetTimeout);
        this.alertMessage = {
          type: "alert-success",
          text: "Brukerendringer registrert.",
        };
        this.resetTimeout = setTimeout(() => {
          this.alertMessage = null;
        }, 3000);
      } else if (response.status === 409) {
        clearTimeout(this.resetTimeout);
        this.alertMessage = {
          type: "alert-danger",
          text: "Motstridende data. Prøv å endre e-postadressen.  ",
        };
        setTimeout(() => {
          this.alertMessage = null;
        }, 3000);
      } else if (response.status === 400) {
        clearTimeout(this.resetTimeout);
        this.alertMessage = {
          type: "alert-danger",
          text: "Ufullstendig data.",
        };
        setTimeout(() => {
          this.alertMessage = null;
        }, 3000);
      }
    },
  },
  template: html`
    <div class="container">
      <div class="row">
        <form class="col-md-6" id="loginPageLoginForm" v-if="!hideLogin">
          <h1>Logg inn</h1>
          <div class="form-group">
            <label for="loginPageUsernameInput" class="form-label"
              >Brukernavn (e-post):</label
            >
            <input
              v-model="username"
              type="email"
              class="form-control mb-2"
              id="loginPageUsernameInput"
            />
          </div>
          <div class="form-group">
            <label for="loginPagePasswordInput" class="form-label"
              >Passord:</label
            >
            <input
              v-model="password"
              type="password"
              class="form-control mb-2"
              id="loginPagePasswordInput"
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary my-2"
            @click.stop.prevent="sendLoginForm"
          >
            Logg inn
          </button>
          <alertmessage
            v-if="loginAlertObject"
            :alert-message="loginAlertObject"
          ></alertmessage>
        </form>
        <form class="col">
          <h1 v-if="!hideLogin">Opprett bruker</h1>
          <alertmessage
            v-if="msg"
            :alert-message="{type:'alert-warning', text: msg}"
          ></alertmessage>

          <div class="form-group">
            <label for="loginPageNewUsernameInput" class="form-label"
              >E-post:
            </label>
            <input
              v-model="newUsername"
              type="email"
              class="form-control mb-2"
              id="loginPageNewUsernameInput"
              required
            />
          </div>
          <div v-if="editing" class="row">
            <div class="form-group col-md-6">
              <label for="loginPageNewFirstNameInput" class="form-label"
                >Fornavn:</label
              >
              <input
                v-model="newFirstName"
                type="text"
                class="form-control mb-2"
                id="loginPageNewFullNameInput"
              />
            </div>
            <div class="form-group col-md-6">
              <label for="loginPageNewLastNameInput" class="form-label"
                >Etternavn:</label
              >
              <input
                v-model="newLastName"
                type="text"
                class="form-control mb-2"
                id="loginPageNewLastNameInput"
              />
            </div>
          </div>
          <div class="form-group" v-else>
            <label for="loginPageNewFullNameInput" class="form-label"
              >For- og etternavn:</label
            >
            <input
              v-model="newFullName"
              type="text"
              class="form-control mb-2"
              id="loginPageNewFullNameInput"
            />
          </div>
          <div class="form-group">
            <label for="loginPageNewTelephoneInput" class="form-label"
              >Telefonnummer:</label
            >
            <input
              v-model="newTelephone"
              type="text"
              class="form-control mb-2"
              id="loginPageNewTelephoneInput"
            />
          </div>
          <div class="form-group">
            <label for="loginPageNewPassword1Input" class="form-label"
              >Passord:</label
            >
            <input
              autocomplete="new-password"
              v-model="newPassword1"
              type="password"
              class="form-control mb-2"
              id="loginPageNewPassword1Input"
              required
            />
          </div>

          <div class="form-group">
            <label for="loginPageNewPassword2Input" class="form-label"
              >Bekreft passord:</label
            >
            <input
              v-model="newPassword2"
              type="password"
              class="form-control mb-2"
              id="loginPageNewPassword2Input"
              required
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary my-2"
            :disabled="msg !== ''"
            @click.stop.prevent="sendNewUserForm"
          >
            {{ editing == null ? "Opprett bruker" : "Rediger bruker " }}
          </button>
          <alertmessage
            v-if="newPassword1 !== newPassword2"
            :alert-message="{type:'alert-warning',text:'Passordene stemmer ikke overens.'}"
          ></alertmessage>
          <alertmessage
            v-else-if="newPassword1 !== '' && newPassword1?.match(pwRegex) == null"
            :alert-message="{type:'alert-warning',text:'Skriv inn et lengre passord.'}"
          ></alertmessage>

          <!-- dynamisk alert -->
          <alertmessage :alert-message="alertMessage"></alertmessage>
        </form>
      </div>
    </div>
  `,
};
