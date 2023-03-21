const adminpageC = {
  data() {
    return {
      users: [],
    };
  },
  methods: {
    getUsers: function () {
      fetch("/api/user")
        .then((res) => res.json())
        .then((res) => (this.users = res));
    },
    // kilde: https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
  },

  template: html` <div class="container">
    <div class="row">
      <h1>Administratorside</h1>
    </div>
    <div class="accordion" id="accordionPanelsStayOpenExample">
      <div class="accordion-item">
        <h2 class="accordion-header" id="panelsStayOpen-headingOne">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseOne"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseOne"
            @click="getUsers"
          >
            Liste over brukere
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseOne"
          class="accordion-collapse collapse"
          aria-labelledby="panelsStayOpen-headingOne"
        >
          <div class="accordion-body">
            <usertable v-if="users.length" :users="users"> </usertable>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseTwo"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseTwo"
          >
            Konfigurer brukere
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseTwo"
          class="accordion-collapse collapse"
          aria-labelledby="panelsStayOpen-headingTwo"
        >
          <div class="accordion-body">
            <manageusers></manageusers>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="panelsStayOpen-headingThree">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseThree"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseThree"
          >
            Konfigurer hytter
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseThree"
          class="accordion-collapse collapse"
          aria-labelledby="panelsStayOpen-headingThree"
        >
          <div class="accordion-body">
            <managecabins></managecabins>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="panelsStayOpen-headingFour">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseFour"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseFour"
          >
            Se/konfigurer reservasjoner
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseFour"
          class="accordion-collapse collapse"
          aria-labelledby="panelsStayOpen-headingFour"
        >
          <div class="accordion-body">
            <managereservations></managereservations>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="panelsStayOpen-headingFive">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseFive"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseFive"
          >
            Se/konfigurer produkter og lagerbeholdning
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseFive"
          class="accordion-collapse collapse"
          aria-labelledby="panelsStayOpen-headingFive"
        >
          <div class="accordion-body">
            <manageproducts></manageproducts>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  // admin page subcomponents
  components: {
    usertable: {
      props: ["users"],
      template: html`<div>
        <div class="table-responsive-lg">
          <table class="table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Fornavn</th>
                <th scope="col">Etternavn</th>
                <th scope="col">Telefon</th>
                <th scope="col">Email</th>
                <th scope="col">Admin</th>
                <th scope="col">Opprettet</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users">
                <td>{{user.id}}</td>
                <td>{{user.firstName}}</td>
                <td>{{user.lastName}}</td>
                <td>{{user.telephone}}</td>
                <td>{{user.email}}</td>
                <td>{{user.isAdmin ? "Ja" : "Nei"}}</td>
                <td>{{user.regDate}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`,
    },
    manageusers: {
      data() {
        return {
          selectedAction: 1,
          editingUser: "",
          alertDeleteUserSuccess: false,
          alertDeleteUserFail: false,
          alertObject: null,
        };
      },
      watch: {
        // denne watcheren gjør at alertmessage forsvinner etter 3 s
        alertObject: function (value) {
          if (value == null) return; // avoid double watch when watch sets value.
          clearTimeout(this.alertTimeout);
          this.alertTimeout = setTimeout(() => {
            this.alertObject = null;
          }, 3000);
        },
      },
      methods: {
        deleteUser: async function (userid) {
          let response = await fetch(`/api/user/${userid}`, {
            method: "DELETE",
          });
          if (response.status === 205) {
            this.$root.loggedInUser = null;
            this.$router.push({ name: "index" }, () => {});
          } else if (response.ok) {
            this.alertObject = {
              type: "alert-success",
              text: "Bruker slettet.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Forespørselen mislyktes.",
            };
          }
        },
        deleteAllUsers: async function () {
          let response = await fetch("/api/user", { method: "DELETE" });
          if (response.ok) {
            this.alertObject = {
              type: "alert-success",
              text: "Alle brukere slettet.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Forespørselen mislyktes.",
            };
          }
        },
        makeAdmin: async function (userid) {
          let response = await fetch(`/api/user/${userid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isAdmin: true,
            }),
          });

          if (response.ok) {
            this.alertObject = {
              type: "alert-success",
              text: "Tilordning av admin vellykket.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Tilordning av admin feilet.",
            };
          }
        },
        resetFilters: async function (userid) {
          const response = await fetch(`/api/user/${userid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cabinFiltersJson: JSON.stringify({
                selectedView: "1",
                sortOption: "0",
                minCapacity: null,
                maxDistance: null,
                freeSelBegin: null,
                freeSelEnd: null,
                builtSelBegin: null,
                builtSelEnd: null,
                searchString: "",
              }),
            }),
          });
          if (response.ok) {
            this.alertObject = {
              type: "alert-success",
              text: "Vellykket.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Mislykket.",
            };
          }
        },
      },
      template: html`
        <div>
          <select class="form-select mb-3" v-model="selectedAction">
            <option value="1">Legg til bruker</option>
            <option value="2">Rediger bruker</option>
            <option value="6">Tilbakestill brukers visningsfiltre</option>
            <option value="3">Slett bruker</option>
            <option value="4">Tilordne administratorrettigheter</option>
            <option value="5">Slett alle ikke-administratorbrukere</option>
          </select>
          <div v-if="selectedAction == 1">
            <loginpage :hide-login="true" class="px-0"></loginpage>
          </div>
          <div v-else-if="selectedAction == 2">
            <div class="input-group mb-3">
              <span class="input-group-text"> Bruker-ID </span>
              <input class="form-control" type="number" v-model="editingUser" />
            </div>
            <loginpage
              class="px-0"
              v-if="editingUser"
              :hide-login="true"
              :editing="editingUser"
            ></loginpage>
            <alertmessage
              v-if="editingUser === ''"
              :alert-message="{type:'alert-primary', text:'Velg en bruker-ID.'}"
            ></alertmessage>
          </div>

          <div v-else-if="selectedAction == 3">
            <div class="input-group mb-3">
              <span class="input-group-text"> Bruker-ID </span>
              <input class="form-control" type="number" v-model="editingUser" />
            </div>
            <alertmessage
              v-if="editingUser === ''"
              :alert-message="{type:'alert-primary', text:'Velg en bruker-ID.'}"
            ></alertmessage>

            <button
              v-else
              class="btn btn-danger"
              @click="deleteUser(editingUser)"
            >
              Slett bruker
            </button>
          </div>
          <div v-else-if="selectedAction == 4">
            <div class="input-group mb-3">
              <span class="input-group-text"> Bruker-ID </span>
              <input class="form-control" type="number" v-model="editingUser" />
            </div>
            <alertmessage
              v-if="editingUser === ''"
              :alert-message="{type:'alert-primary', text:'Velg en bruker-ID.'}"
            ></alertmessage>

            <button
              v-else
              class="btn btn-success"
              @click="makeAdmin(editingUser)"
            >
              Tilordne admin
            </button>
          </div>
          <div v-else-if="selectedAction == 5">
            <button class="btn btn-danger" @click="deleteAllUsers()">
              NB! SLETT ALLE BRUKERE
            </button>
          </div>
          <div v-else-if="selectedAction == 6">
            <div class="input-group mb-3">
              <span class="input-group-text"> Bruker-ID </span>
              <input class="form-control" type="number" v-model="editingUser" />
            </div>
            <alertmessage
              v-if="editingUser === ''"
              :alert-message="{type:'alert-primary', text:'Velg en bruker-ID.'}"
            ></alertmessage>
            <button
              v-else
              class="btn btn-primary"
              @click="resetFilters(editingUser)"
            >
              Tilbakestill filtre
            </button>
          </div>
          <alertmessage
            v-if="alertObject"
            :alert-message="alertObject"
          ></alertmessage>
        </div>
      `,
    },
    managecabins: {
      data() {
        const newCabinResetObject = {
          newCabinName: "",
          newCabinQuadrant: 1,
          newCabinLatitude: 0,
          newCabinLongitude: 0,
          newCabinBuildDate: null,
          newCabinCapacity: 1,
          newCabinPrice: 0,
        };
        return {
          selectedAction: 1,
          selectedImage: null,
          alertObject: null,
          newCabinResetObject,
          ...newCabinResetObject,
          deletingCabin: "",
        };
      },
      methods: {
        sendNewCabinForm: async function () {
          if (
            this.newCabinBuildDate == null ||
            this.selectedImage == null ||
            !this.newCabinName
          ) {
            this.alertObject = {
              type: "alert-danger",
              text:
                "Kunne ikke legge til. Sjekk at du har med byggedato, bilde og navn.",
            };
            this.alertTimeout = setTimeout(
              () => (this.alertObject = null),
              3000
            );
            return;
          }
          const formData = new FormData();
          formData.append("image", this.selectedImage);
          formData.append(
            "json",
            JSON.stringify({
              name: this.newCabinName,
              buildDate: this.newCabinBuildDate,
              location: this.newCabinCoordinateString,
              capacity: this.newCabinCapacity,
              price: this.newCabinPrice,
            })
          );
          let response = await fetch("/api/cabin", {
            method: "POST",
            body: formData,
          });
          clearTimeout(this.alertTimeout);
          if (response.ok) {
            this.alertObject = {
              type: "alert-success",
              text: "Vellykket tillegging av hytte.",
            };
            Object.assign(this, this.newCabinResetObject);
          } else {
            this.alertObject = {
              type: "alert-danger",
              text:
                "Kunne ikke legge til. Sjekk at alle opplysninger er lagt til. Støttede bildetyper er JPEG og PNG.",
            };
          }
          this.alertTimeout = setTimeout(() => (this.alertObject = null), 3000);
        },
        handleImageChange: function (e) {
          if (e.target.files.length) this.selectedImage = e.target.files[0];
        },
        minOneDecimalPlace: function (value) {
          if (typeof value !== "number") value = 0;
          return value.toFixed(
            Math.max(1, value.toString().split(".")[1]?.length ?? 0)
          );
        },
        deleteCabin: async function (cabinid) {
          let response = await fetch(`/api/cabin/${cabinid}`, {
            method: "DELETE",
          });
          if (response.ok) {
            clearTimeout(this.alertTimeout);
            this.alertObject = {
              type: "alert-success",
              text: "Sletting vellykket.",
            };
            this.alertTimeout = setTimeout(
              () => (this.alertObject = null),
              3000
            );
          } else {
            clearTimeout(this.alertTimeout);
            this.alertObject = {
              type: "alert-danger",
              text: "Sletting ikke vellykket.",
            };
            this.alertTimeout = setTimeout(
              () => (this.alertObject = null),
              3000
            );
          }
        },
        deleteAllCabins: async function () {
          let response = await fetch("/api/cabin", {
            method: "DELETE",
          });
          if (response.ok) {
            clearTimeout(this.alertTimeout);
            this.alertObject = {
              type: "alert-success",
              text: "Sletting vellykket.",
            };
            this.alertTimeout = setTimeout(
              () => (this.alertObject = null),
              3000
            );
          } else {
            clearTimeout(this.alertTimeout);
            this.alertObject = {
              type: "alert-danger",
              text: "Sletting ikke vellykket.",
            };
            this.alertTimeout = setTimeout(
              () => (this.alertObject = null),
              3000
            );
          }
        },
      },
      computed: {
        newCabinCoordinateString: function () {
          // passer på at koordinatene alltid har minst en desimal
          const latLetter = [3, 4].includes(this.newCabinQuadrant) ? "S" : "N",
            longLetter = [2, 4].includes(this.newCabinQuadrant) ? "W" : "E",
            latitude = this.minOneDecimalPlace(this.newCabinLatitude),
            longitude = this.minOneDecimalPlace(this.newCabinLongitude);
          return `${latitude}\u00B0${latLetter}, ${longitude}\u00B0${longLetter}`;
        },
      },

      template: html`
        <div>
          <select class="form-select mb-3" v-model="selectedAction">
            <option value="1">Legg til hytte</option>
            <option value="2">Slett hytte</option>
            <option value="3">Slett alle hytter</option>
          </select>
          <div v-if="selectedAction == 1">
            <form>
              <div class="mb-3">
                <label for="formFile" class="form-label"
                  >Last opp et bilde</label
                >
                <input
                  class="form-control mb-3"
                  type="file"
                  id="formFile"
                  @change="handleImageChange"
                />
                <label for="newCabinNameInput" class="form-label">Navn:</label>
                <input
                  v-model="newCabinName"
                  type="text"
                  class="form-control mb-2"
                  id="newCabinNameInput"
                />
                <div class="row">
                  <div class="col-md-4">
                    <label for="newCabinQuadrantSelect" class="form-label"
                      >Koordinater - kvadrant:</label
                    >
                    <select
                      class="form-select mb-2"
                      id="newCabinQuadrantSelect"
                      v-model.number="newCabinQuadrant"
                    >
                      <option value="1">N-E (nordøstlig)</option>
                      <option value="2">N-W (nordvestlig)</option>
                      <option value="3">S-E (sørøstlig)</option>
                      <option value="4">S-W (sørvestlig)</option>
                    </select>
                  </div>
                  <div class="col-sm-6 col-md-4">
                    <label for="newCabinLatitudeInput" class="form-label">
                      Breddegrad:
                    </label>
                    <input
                      v-model.number="newCabinLatitude"
                      type="number"
                      class="form-control mb-2"
                      id="newCabinLatitudeInput"
                      min="0"
                      max="90"
                      step="0.00001"
                    />
                  </div>
                  <div class="col-sm-6 col-md-4">
                    <label for="newCabinLongitudeInput" class="form-label">
                      Lengdegrad:
                    </label>
                    <input
                      v-model.number="newCabinLongitude"
                      type="number"
                      class="form-control mb-2"
                      id="newCabinLongitudeInput"
                      min="0"
                      max="90"
                      step="0.00001"
                    />
                  </div>
                </div>

                <label for="newCabinBuildDateInput" class="form-label">
                  Byggedato:
                </label>
                <input
                  v-model="newCabinBuildDate"
                  type="date"
                  class="form-control mb-2"
                  id="newCabinBuildDateInput"
                />
                <label for="newCabinCapacityInput" class="form-label">
                  Sengeplasser:
                </label>
                <input
                  v-model="newCabinCapacity"
                  min="1"
                  type="number"
                  class="form-control mb-2"
                  id="newCabinCapacityInput"
                />
                <label for="newCabinPriceInput" class="form-label">
                  Pris per døgn:
                </label>
                <input
                  v-model="newCabinPrice"
                  min="0"
                  type="number"
                  class="form-control mb-2"
                  id="newCabinPriceInput"
                />
              </div>
              <button
                class="btn btn-success"
                @click.stop.prevent="sendNewCabinForm"
              >
                Send
              </button>
            </form>
          </div>
          <div v-else-if="selectedAction == 2">
            <div class="input-group mb-3">
              <span class="input-group-text"> Hytte-ID </span>
              <input
                class="form-control"
                type="number"
                v-model="deletingCabin"
              />
            </div>
            <alertmessage
              v-if="deletingCabin ===''"
              :alert-message="{type:'alert-primary', text:'Velg en hytte-ID.'}"
            ></alertmessage>

            <button
              v-else
              class="btn btn-danger"
              @click="deleteCabin(deletingCabin)"
            >
              Slett hytte og tilhørende reservasjoner
            </button>
          </div>
          <div v-else-if="selectedAction == 3">
            <button class="btn btn-danger" @click="deleteAllCabins()">
              NB! SLETT ALLE HYTTER
            </button>
          </div>
          <alertmessage
            v-if="alertObject"
            :alert-message="alertObject"
          ></alertmessage>
        </div>
      `,
    },
    managereservations: {
      components: {
        cabinreservationstable: {
          props: ["reservations"],
          filters: {
            formatStatus: function (reservation) {
              return `${reservation.verified ? "Bekreftet" : "Ubekreftet"}, 
                          betaling ${
                            reservation.paidFor ? "" : "ikke"
                          } registrert.`;
            },
          },
          methods: {
            rowContextualClass: function (reservation) {
              // hvis sluttdato før i dag
              if (new Date(reservation.endDate) < new Date()) {
                return ["bg-secondary", "text-white"];
              } else if (reservation.verified && reservation.paidFor) {
                // hvis bekreftet og betalt.
                return ["bg-success", "text-white"];
              }
              return [];
            },
          },
          template: html`<div>
            <div class="table-responsive-lg" v-if="reservations?.length">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Status</th>
                    <th scope="col">Bruker-ID</th>
                    <th scope="col">Innsendt</th>
                    <th scope="col">Fra</th>
                    <th scope="col">Til</th>
                    <th scope="col">Personer</th>
                    <th scope="col">Proviant</th>
                    <th scope="col">Totalpris</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="reservation in reservations"
                    :class="rowContextualClass(reservation)"
                  >
                    <td>{{reservation.id}}</td>
                    <td>{{reservation | formatStatus }}</td>
                    <td>{{reservation.reservedBy}}</td>
                    <td>{{reservation.regDate}}</td>
                    <td>{{reservation.startDate}}</td>
                    <td>{{reservation.endDate}}</td>
                    <td>{{reservation.persons}}</td>
                    <td v-if="reservation.provisionsJson == '[]'">Ingen</td>
                    <td v-else>
                      <ul>
                        <li
                          v-for="item in JSON.parse(reservation.provisionsJson)"
                        >
                          {{item.name}} ({{item.amount}})
                        </li>
                      </ul>
                    </td>
                    <td>{{reservation.totalPrice | priceNOK }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="row" v-else>
              <alertmessage
                class="col alertmessage-gutter-fix"
                :alert-message="{type:'alert-primary',text:'Du har ingen reservasjoner å vise. Legg gjerne til en reservasjon, da vel!'}"
              ></alertmessage>
            </div>
          </div> `,
        },
      },
      data() {
        return {
          selectedAction: 1,
          currentReservationId: "",
          currentReservationExists: false,
          currentUserId: "",
          currentUserExists: false,
          currentCabinId: "",
          currentReservations: [],
          currentCabinObj: null,
          checkboxConfirm: true,
          checkboxPaid: false,
          alertObject: null,
        };
      },
      methods: {
        currentUserIdWatcher: async function (value) {
          if (this.selectedAction == 1) {
            if (value === "") {
              this.currentReservations = [];
              return;
            }
            let response = await fetch(`/api/reservation/user/${value}`);
            if (response.ok) {
              this.currentReservations = await response.json();
            } else {
              this.currentReservations = [];
            }
          } else if (this.selectedAction == 3) {
            if (value === "") {
              this.currentUserExists = false;
              return;
            }
            let response = await fetch(`/api/user/${value}`);
            if (response.ok) {
              this.currentUserExists = !!(await response.json()).length;
            } else {
              this.currentUserExists = false;
            }
          }
        },
        currentCabinIdWatcher: async function (value) {
          if (this.selectedAction == 2) {
            if (value === "") {
              this.currentReservations = [];
              return;
            }
            let response = await fetch(`/api/reservation/cabin/${value}`);
            if (response.ok) {
              this.currentReservations = await response.json();
            } else {
              this.currentReservations = [];
            }
          } else if (this.selectedAction == 3) {
            if (value === "") {
              this.currentCabinObj = null;
              return;
            }
            let response = await fetch(`/api/cabin/${value}`);
            if (response.ok) {
              this.currentCabinObj = (await response.json())?.[0];
            } else {
              this.currentCabinObj = [];
            }
          }
        },
        confirmReservation: async function (value) {
          const editObject = {};
          if (this.checkboxConfirm) editObject.verified = true;
          if (this.checkboxPaid) editObject.paidFor = true;
          const response = await fetch(`/api/reservation/${value}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editObject),
          });
          if (response.status === 409) {
            clearTimeout(this.alertTimeout);
            this.alertObject = {
              type: "alert-warning",
              text:
                "Motstridende data. Sjekk at lagerbeholdningen er tilstrekkelig.",
            };
            setTimeout(() => (this.alertObject = null), 3000);
          } else {
            this.setAlertMessage(response.ok);
          }
        },
        confirmAllReservations: async function () {
          const editObject = {};
          if (this.checkboxConfirm) editObject.verified = true;
          if (this.checkboxPaid) editObject.paidFor = true;
          const response = await fetch("/api/reservation", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editObject),
          });
          if (response.status === 409) {
            clearTimeout(this.alertTimeout);
            this.alertObject = {
              type: "alert-warning",
              text:
                "Motstridende data. Sjekk at lagerbeholdningen er tilstrekkelig.",
            };
            setTimeout(() => (this.alertObject = null), 3000);
          } else {
            this.setAlertMessage(response.ok);
          }
        },
        deleteReservation: async function (value) {
          const response = await fetch(`/api/reservation/${value}`, {
            method: "DELETE",
          });
          this.setAlertMessage(response.ok);
        },
        deleteAllReservations: async function () {
          const response = await fetch("/api/reservation", {
            method: "DELETE",
          });
          this.setAlertMessage(response.ok);
        },
        setAlertMessage: function (success) {
          clearTimeout(this.alertTimeout);
          if (success) {
            this.alertObject = {
              type: "alert-success",
              text: "Vellykket forespørsel.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Forespørselen var ikke vellykket.",
            };
          }
          setTimeout(() => (this.alertObject = null), 3000);
        },
      },
      watch: {
        currentUserId: async function (value) {
          await this.currentUserIdWatcher(value);
        },
        currentCabinId: async function (value) {
          await this.currentCabinIdWatcher(value);
        },
        currentReservationId: async function (value) {
          if (value === "") {
            this.currentReservationExists = false;
            return;
          }
          let response = await fetch(`/api/reservation/${value}`);
          if (response.ok) {
            this.currentReservationExists = !!(await response.json()).length;
          } else {
            this.currentReservationExists = false;
          }
        },
        selectedAction: async function (value) {
          // watchere bruker selectedAction, så må kjøres på nytt.
          if (value == 1 || value == 3)
            await this.currentUserIdWatcher(this.currentUserId);
          if (value == 2 || value == 3)
            await this.currentCabinIdWatcher(this.currentCabinId);
        },
      },
      template: html` <div>
        <select class="form-select mb-3" v-model="selectedAction">
          <option value="1">Se reservasjoner per bruker</option>
          <option value="2">Se reservasjoner per hytte</option>
          <option value="3">Legg til reservasjon</option>
          <option value="4">Godkjenn reservasjon</option>
          <option value="5">Godkjenn alle reservasjoner</option>
          <option value="6">Slett reservasjon</option>
          <option value="7">Slett alle reservasjoner</option>
        </select>
        <div v-if="selectedAction == 1">
          <div class="input-group mb-3">
            <span class="input-group-text"> Bruker-ID </span>
            <input class="form-control" type="number" v-model="currentUserId" />
          </div>
          <reservationstable
            v-if="currentReservations.length"
            :reservations="currentReservations"
          ></reservationstable>
          <alertmessage
            v-else
            :alert-message="{type:'alert-primary', text:'Ingenting å vise.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 2">
          <div class="input-group mb-3">
            <span class="input-group-text"> Hytte-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentCabinId"
            />
          </div>
          <cabinreservationstable
            v-if="currentReservations.length"
            :reservations="currentReservations"
          ></cabinreservationstable>
          <alertmessage
            v-else
            :alert-message="{type:'alert-primary', text:'Ingenting å vise.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 3">
          <div class="input-group mb-3">
            <span class="input-group-text"> Bruker-ID </span>
            <input class="form-control" type="number" v-model="currentUserId" />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text"> Hytte-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentCabinId"
            />
          </div>
          <cabininfoinputs
            :cabinObj="currentCabinObj"
            :userId="currentUserId"
            v-if="currentCabinObj && currentUserExists"
          ></cabininfoinputs>
          <alertmessage
            v-else
            :alert-message="{type:'alert-warning',text:'Ikke-eksisterende bruker- eller hytte-ID.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 4">
          <div class="input-group mb-3">
            <span class="input-group-text"> Reservasjons-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentReservationId"
            />
          </div>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="flexSwitchCheckConfirm"
              v-model="checkboxConfirm"
            />
            <label class="form-check-label" for="flexSwitchCheckConfirm">
              Bekreft reservasjon.
            </label>
          </div>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="flexSwitchCheckPaid"
              v-model="checkboxPaid"
            />
            <label class="form-check-label" for="flexSwitchCheckPaid">
              Registrer betalt reservasjon.
            </label>
          </div>
          <button
            v-if="currentReservationExists"
            class="btn btn-success mt-2"
            @click="confirmReservation(currentReservationId)"
            :disabled="!(checkboxConfirm || checkboxPaid)"
          >
            Registrer godkjenning
          </button>
          <alertmessage
            v-else
            :alert-message="{type:'alert-warning',text:'Ikke-eksisterende reservasjons-ID.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 5">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="flexSwitchCheckConfirm"
              v-model="checkboxConfirm"
            />
            <label class="form-check-label" for="flexSwitchCheckConfirm">
              Bekreft reservasjon.
            </label>
          </div>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              id="flexSwitchCheckPaid"
              v-model="checkboxPaid"
            />
            <label class="form-check-label" for="flexSwitchCheckPaid">
              Registrer betalt reservasjon.
            </label>
          </div>
          <button
            class="btn btn-success mt-2"
            @click="confirmAllReservations()"
            :disabled="!(checkboxConfirm || checkboxPaid)"
          >
            Registrer godkjenning for alle reservasjoner
          </button>
        </div>
        <div v-else-if="selectedAction == 6">
          <div class="input-group mb-3">
            <span class="input-group-text"> Reservasjons-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentReservationId"
            />
          </div>

          <button
            v-if="currentReservationExists"
            class="btn btn-danger"
            @click="deleteReservation(currentReservationId)"
          >
            Slett reservasjon
          </button>
          <alertmessage
            v-else
            :alert-message="{type:'alert-warning',text:'Ikke-eksisterende reservasjons-ID.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 7">
          <button class="btn btn-danger" @click="deleteAllReservations()">
            NB! SLETT ALLE RESERVASJONER
          </button>
        </div>
        <alertmessage
          v-if="alertObject"
          :alert-message="alertObject"
        ></alertmessage>
      </div>`,
    },
    manageproducts: {
      data() {
        return {
          selectedAction: 1,
          currentCabinId: "",
          currentProductId: "",
          alertObject: null,
          productArray: [],
          inventoryArray: [],
          newAmount: 0,
          newPrice: 0,
          newName: "",
        };
      },
      watch: {
        alertObject: function (value) {
          if (value == null) return; // avoid double watch when watch sets value.
          clearTimeout(this.alertTimeout);
          this.alertTimeout = setTimeout(() => {
            this.alertObject = null;
          }, 3000);
        },
      },
      methods: {
        getProducts: async function () {
          let response = await fetch("/api/products");
          if (response.ok) {
            this.productArray = await response.json();
          }
        },
        getInventory: async function () {
          if (this.currentCabinId === "") return;
          let response = await fetch(
            `/api/products/cabin/${this.currentCabinId}`
          );
          if (response.ok) {
            this.inventoryArray = await response.json();
          }
        },
        addProduct: async function () {
          let response = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: this.newName, price: this.newPrice }),
          });
          if (response.ok) {
            await this.getProducts();
            this.newName = "";
            this.newPrice = 0;
            this.alertObject = {
              type: "alert-success",
              text: "Tillegging av produkt vellykket.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text:
                "Tillegging av produkt mislyktes. Sjekk at du har med navn og pris, og at disse er gyldige verdier.",
            };
          }
        },
        deleteProduct: async function (productid) {
          let response = await fetch(`/api/products/${productid}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await this.getProducts();
            await this.getInventory();
            this.alertObject = {
              type: "alert-success",
              text: "Sletting vellykket.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Noe gikk galt under sletting.",
            };
          }
        },
        editInventory: async function () {
          if (
            this.currentCabinId === "" ||
            this.currentProductId === "" ||
            this.newAmount === ""
          )
            this.alertObject = {
              type: "alert-danger",
              text: "Pass på at du har med alle felter.",
            };
          let response = await fetch(
            `/api/inventory/${this.currentCabinId}/${this.currentProductId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: this.newAmount }),
            }
          );
          if (response.ok) {
            await this.getInventory(this.currentCabinId);
          }
          if (response.status === 200) {
            this.alertObject = {
              type: "alert-success",
              text: "Oppdaterte lagerbeholdning for produkt.",
            };
          } else if (response.status === 201) {
            this.alertObject = {
              type: "alert-success",
              text: "Opprettet lagerbeholdning for produkt.",
            };
          } else if (response.status === 204) {
            this.alertObject = {
              type: "alert-primary",
              text: "Nullet ut lagerbeholdning for produkt.",
            };
          } else if (response.status === 404) {
            this.alertObject = {
              type: "alert-danger",
              text: "Sjekk at hytte- og produkt-ID-er er gyldige.",
            };
          } else {
            this.alertObject = {
              type: "alert-danger",
              text: "Noe gikk galt under endring av lagerbeholdning.",
            };
          }
        },
      },
      template: html` <div>
        <select class="form-select mb-3" v-model="selectedAction">
          <option value="1">Se/slett produkttyper</option>
          <option value="2">Se lagerbeholdning på hytte</option>
          <option value="3">Legg til ny produkttype</option>
          <option value="4">Endre lagerbeholdning</option>
        </select>
        <div v-if="selectedAction == 1">
          <button class="btn btn-primary" @click="getProducts">
            {{productArray.length ? "Oppdater" : "Hent"}} produkter
          </button>
          <table class="table" v-if="productArray?.length">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Navn</th>
                <th scope="col">Pris</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in productArray">
                <td>{{product.id}}</td>
                <td>{{product.name}}</td>
                <td>{{product.price | priceNOK}}</td>
                <td>
                  <button
                    class="btn btn-danger btn-sm"
                    @click="deleteProduct(product.id)"
                  >
                    Slett
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <alertmessage
            v-else
            :alert-message="{type:'alert-primary',text:'Ingen produkter å vise.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 2">
          <div class="input-group mb-3">
            <span class="input-group-text"> Hytte-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentCabinId"
              @input="getInventory"
            />
          </div>
          <alertmessage
            v-if="currentCabinId ===''"
            :alert-message="{type:'alert-primary', text:'Velg en hytte-ID.'}"
          ></alertmessage>
          <table v-else-if="inventoryArray.length" class="table">
            <thead>
              <tr>
                <th scope="col">Produkt-ID</th>
                <th scope="col">Produktnavn</th>
                <th scope="col">Pris</th>
                <th scope="col">Mengde</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in inventoryArray">
                <td>{{product.id}}</td>
                <td>{{product.name}}</td>
                <td>{{product.price | priceNOK}}</td>
                <td>{{product.amount}}</td>
                <td>
                  <button
                    class="btn btn-success btn-sm"
                    @click="selectedAction = 4;currentProductId=product.id"
                  >
                    Endre
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <alertmessage
            v-else
            :alert-message="{type:'alert-primary',text:'Ingen produkter å vise.'}"
          ></alertmessage>
        </div>
        <div v-else-if="selectedAction == 3">
          <div class="input-group mb-3">
            <span class="input-group-text"> Produktnavn </span>
            <input class="form-control" type="text" v-model="newName" />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text"> Pris </span>
            <input
              class="form-control"
              type="number"
              v-model="newPrice"
              min="0"
            />
          </div>
          <button
            class="my-3 btn btn-success"
            :disabled="newName ===''||newPrice===''"
            @click="addProduct"
          >
            Legg til produkt
          </button>
        </div>
        <div v-else-if="selectedAction == 4">
          <div class="input-group mb-3">
            <span class="input-group-text"> Hytte-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentCabinId"
            />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text"> Produkt-ID </span>
            <input
              class="form-control"
              type="number"
              v-model="currentProductId"
            />
          </div>
          <alertmessage
            v-if="currentCabinId ===''"
            :alert-message="{type:'alert-primary', text:'Velg en hytte-ID.'}"
          ></alertmessage>
          <alertmessage
            v-else-if="currentProductId ===''"
            :alert-message="{type:'alert-primary', text:'Velg en produkt-ID.'}"
          ></alertmessage>
          <div v-else class="input-group mb-3">
            <span class="input-group-text"> Nytt antall produkter </span>
            <input
              min="0"
              class="form-control"
              type="number"
              v-model.number="newAmount"
            />
          </div>
          <button
            class="my-3 btn btn-success"
            :disabled="currentCabinId==='' || currentProductId==='' || newAmount===''"
            @click="editInventory"
          >
            Send inn endring
          </button>
        </div>

        <alertmessage
          v-if="alertObject"
          :alert-message="alertObject"
        ></alertmessage>
      </div>`,
    },
  },
};
