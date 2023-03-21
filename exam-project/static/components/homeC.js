const homeC = {
  data() {
    return {
      users: [],
      cabinObj: null,
      sortOption: "0",
      minCapacity: null,
      maxDistance: null,
      freeSelBegin: null,
      freeSelEnd: null,
      builtSelBegin: null,
      builtSelEnd: null,
      searchString: "",
      freeCabinIds: null,
      currentPosition: null,
      selectedView: "1",
    };
  },
  watch: {
    sortOption: function (value) {
      this.sortCabins(value);
    },
    maxDistance: function () {
      this.ensurePositionExists();
    },
    freeSelBegin: function () {
      this.updateFreeCabinIds();
    },
    freeSelEnd: function () {
      this.updateFreeCabinIds();
    },
  },
  computed: {
    searchRegExp: function () {
      return new RegExp(this.searchString, "i");
    },
    filteredCabins: function () {
      // const vm = this;
      if (this.currentPosition != null && this.cabinObj != null)
        this.cabinObj.forEach((cabin) => {
          cabin.distance = Math.round(
            this.distanceToMyPos(cabin, this.currentPosition)
          );
        });
      return this.cabinObj?.filter((cabin) => {
        if (cabin.capacity < this.minCapacity ?? 0) return false;
        if (!this.searchRegExp.test(cabin.name)) return false;
        if (cabin.buildDate < this.builtSelBegin ?? Infinity) return false;
        if (cabin.buildDate > this.builtSelEnd ?? -Infinity) return false;
        if (this.freeCabinIds != null && !this.freeCabinIds.includes(cabin.id))
          return false;
        if (
          this.currentPosition != null &&
          this.distanceToMyPos(cabin, this.currentPosition) >
            (this.maxDistance ?? Infinity)
        )
          return false;

        return true;
      });
    },
  },
  created: async function () {
    let response = await fetch("/api/user");
    if (response.ok) {
      const result = await response.json();
      this.users = result;
    }
    response = await fetch("/api/cabin");
    if (response.ok) {
      const result = await response.json();
      this.cabinObj = result;
    }
  },
  methods: {
    sortCabins: function (value) {
      if (value === "7" && this.currentPosition == null) {
        // sorter etter nærmest
        const vm = this;
        this.ensurePositionExists(() => {
          vm.sortCabins("7");
        });
        return;
      }
      const sortFunctions = [
        (a, b) => a.price - b.price,
        (a, b) => b.price - a.price,
        (a, b) => (b.buildDate > a.buildDate ? 1 : -1),
        (a, b) => (a.buildDate > b.buildDate ? 1 : -1),
        (a, b) => a.name.localeCompare(b.name, "no", { sensitivity: "base" }),
        (a, b) => b.capacity - a.capacity,
        (a, b) =>
          this.distanceToMyPos(a, this.currentPosition) -
          this.distanceToMyPos(b, this.currentPosition),
      ];
      value = Number(value) - 1;
      if (!(value in sortFunctions)) return;
      this.cabinObj.sort(sortFunctions[value]);
    },
    updateFreeCabinIds: async function () {
      if ((this.freeSelBegin ?? "") === "" || (this.freeSelEnd ?? "") === "") {
        this.freeCabinIds = null;
        return;
      }
      let response = await fetch(
        `/api/cabin/free/${this.freeSelBegin}/${this.freeSelEnd}`
      );
      if (response.ok) {
        const result = await response.json();
        this.freeCabinIds = result;
      }
    },
    distanceToMyPos: (cabin, { latitude, longitude }) => {
      const RADIUS_EARTH = 6371;
      const DEG_TO_RAD = Math.PI / 180;
      let [cabinLat, cabinLong] = cabin.location.match(/[-0-9]+\.[-0-9]+/g);
      // i tilfelle funksjonen skal brukes utenfor den nordøstlige kvartkule/kvadrant
      if (cabin.location.indexOf("S") !== -1) cabinLat *= -1;
      if (cabin.location.indexOf("W") !== -1) cabinLong *= -1;
      // fant formel for avstand på nett og skrev om til javascript
      const d =
        2 *
        RADIUS_EARTH *
        Math.asin(
          Math.sqrt(
            Math.pow(
              Math.sin((latitude * DEG_TO_RAD - cabinLat * DEG_TO_RAD) / 2),
              2
            ) +
              Math.cos(latitude * DEG_TO_RAD) *
                Math.cos(cabinLat * DEG_TO_RAD) *
                Math.pow(
                  Math.sin(
                    (longitude * DEG_TO_RAD - cabinLong * DEG_TO_RAD) / 2
                  ),
                  2
                )
          )
        );
      return d;
    },
    ensurePositionExists: function (additionalCallback = () => {}) {
      if (this.currentPosition != null) return;
      const vm = this;
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        vm.currentPosition = { latitude, longitude };
        additionalCallback();
      });
    },
    updateFilters: function (filtersObject) {
      Object.assign(this, filtersObject);
    },
  },
  components: {
    listview: {
      props: ["filteredCabins"],
      template: html` <div class="row">
        <div>
          <ul class="list-group">
            <li
              class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center"
              v-for="cabin in filteredCabins"
            >
              <div class="d-flex flex-row align-items-center">
                <img
                  :src="'/static/img/'+cabin.imageURL"
                  alt="List image cap"
                  style="width: 100px; height: 80px; object-fit: cover;"
                />
                <div class="ms-2">
                  <span class="h4">{{cabin.name}}</span><br />
                  Oppført {{new Date(cabin.buildDate).toLocaleString("nb-no",
                  {day: "numeric", month:"long", year:"numeric"})}},
                  {{cabin.capacity}} sengeplasser<span v-if="cabin.distance"
                    >, {{cabin.distance}} km unna</span
                  >
                </div>
              </div>
              <div
                class="d-flex flex-column align-items-end justify-content-end"
              >
                <span class="h6"> {{cabin.price | priceNOK}} </span>
                <div
                  class="btn-group"
                  role="group"
                  aria-label="Go to cabin info"
                >
                  <router-link
                    :to="'/cabininfo/' + cabin.id"
                    class="btn btn-primary"
                    >Mer info</router-link
                  >
                  <router-link
                    v-if="$root.loggedInUser"
                    :to="'/cabininfo/' + cabin.id + '#booking-anchor'"
                    class="btn btn-outline-success"
                    >Reserver</router-link
                  >
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>`,
    },

    accordionview: {
      props: ["filteredCabins"],
      template: html` <div class="row">
        <div class="accordion">
          <div class="accordion-item" v-for="cabin in filteredCabins">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="'#panelsStayOpen-collapse'+cabin.id"
              >
                <strong>{{cabin.name}}</strong>
              </button>
            </h2>
            <div
              :id="'panelsStayOpen-collapse'+cabin.id"
              class="accordion-collapse collapse"
            >
              <div class="accordion-body">
                <div class="row">
                  <div class="col-xs-12 col-md-7 mb-2">
                    <img
                      class="rounded img-fluid"
                      :src="'/static/img/'+cabin.imageURL"
                    />
                  </div>
                  <div class="col-xs-12 col-md-5">
                    <ul class="my-2">
                      <li>
                        <strong>Oppført:</strong> {{new
                        Date(cabin.buildDate).toLocaleString("nb-no", {day:
                        "numeric", month:"long", year:"numeric"})}}
                      </li>
                      <li>
                        <strong>Koordinater:</strong>
                        <a
                          target="_blank"
                          :href="'https://www.norgeskart.no/#!?project=norgeskart&sok=' + encodeURI(cabin.location)"
                          >{{cabin.location}}</a
                        >
                      </li>
                      <li>
                        <strong>Veibeskrivelse:</strong>
                        <a
                          target="_blank"
                          :href="'https://www.google.com/maps/dir/?api=1&destination=' + encodeURI(cabin.location)"
                        >
                          Google Maps
                        </a>
                      </li>
                      <li><strong>Sengeplasser:</strong> {{cabin.capacity}}</li>
                      <li v-if="cabin.distance != null">
                        <strong>Avstand fra meg:</strong> {{cabin.distance}} km
                      </li>
                      <li>
                        <strong>Pris per natt:</strong> {{cabin.price | priceNOK
                        }}
                      </li>
                    </ul>
                    <div
                      class="btn-group"
                      role="group"
                      aria-label="Go to cabin info"
                    >
                      <router-link
                        :to="'/cabininfo/' + cabin.id"
                        class="btn btn-primary"
                        >Mer info</router-link
                      >
                      <router-link
                        v-if="$root.loggedInUser"
                        :to="'/cabininfo/' + cabin.id + '#booking-anchor'"
                        class="btn btn-outline-success"
                        >Reserver</router-link
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`,
    },
  },
  template: html`
    <div class="container">
      <div class="row">
        <div class="col-md-6 mb-sm-2">
          <p class="h1">Hytteoversikt</p>
        </div>
        <div class="col-md-6 mb-3">
          <button
            class="btn btn-primary float-md-end"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#cabinViewFilters"
            aria-expanded="false"
            aria-controls="cabinViewFilters"
          >
            Vis filter
          </button>
        </div>
      </div>
      <div class="row">
        <div class="collapse mb-2" id="cabinViewFilters">
          <cabinfilters @update-filters="updateFilters"></cabinfilters>
        </div>
      </div>
      <div v-if="filteredCabins?.length">
        <div class="row" v-if="selectedView == 1">
          <cabincard
            v-for="cabin in filteredCabins"
            :cabinObj="cabin"
          ></cabincard>
        </div>
        <listview
          :filteredCabins="filteredCabins"
          v-else-if="selectedView == 2"
        ></listview>
        <accordionview
          :filteredCabins="filteredCabins"
          v-else-if="selectedView == 3"
        ></accordionview>
      </div>
      <div class="row" v-else>
        <alertmessage
          class="col alertmessage-gutter-fix"
          :alert-message="{type:'alert-primary',text:'Ingen resulater å vise. Prøv å gjøre søket mindre resktriktivt.'}"
        ></alertmessage>
      </div>
    </div>
  `,
};
