const cabinfiltersC = {
  data() {
    return {
      selectedView: "1",
      sortOption: "0",
      minCapacity: null,
      maxDistance: null,
      freeSelBegin: null,
      freeSelEnd: null,
      builtSelBegin: null,
      builtSelEnd: null,
      searchString: "",
    };
  },
  methods: {
    resetFilters: function () {
      Object.assign(this, {
        selectedView: "1",
        sortOption: "0",
        minCapacity: null,
        maxDistance: null,
        freeSelBegin: null,
        freeSelEnd: null,
        builtSelBegin: null,
        builtSelEnd: null,
        searchString: "",
      });
    },
    updateFilters: function (cabinFiltersJson) {
      if (cabinFiltersJson == null) return;
      Object.assign(this, JSON.parse(cabinFiltersJson));
    },
  },
  computed: {
    filtersObject: function () {
      const {
        selectedView,
        sortOption,
        minCapacity,
        maxDistance,
        freeSelBegin,
        freeSelEnd,
        builtSelBegin,
        builtSelEnd,
        searchString,
      } = this;
      return {
        selectedView,
        sortOption,
        minCapacity,
        maxDistance,
        freeSelBegin,
        freeSelEnd,
        builtSelBegin,
        builtSelEnd,
        searchString,
      };
    },
  },
  components: {
    "load-user-filters": {
      mounted: function () {
        this.$emit("update-filters", this.$root.loggedInUser?.cabinFiltersJson);
      },
    },
  },
  watch: {
    filtersObject: function (value) {
      this.$emit("update-filters", value);
      clearTimeout(this.putFiltersTimeout);
      if (this.$root.loggedInUser != null) {
        // following line needed to sync different cabinfilterC components.
        this.$root.loggedInUser.cabinFiltersJson = JSON.stringify(value);
        const id = this.$root.loggedInUser.id;
        this.putFiltersTimeout = setTimeout(() => {
          fetch(`/api/user/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cabinFiltersJson: JSON.stringify(value) }),
          });
        }, 1000);
      }
    },
  },
  template: html`
    <div class="card card-body">
      <load-user-filters
        class="d-none"
        v-if="$root.loggedInUser"
        @update-filters="updateFilters"
      >
      </load-user-filters>
      <div class="mb-2">
        <input
          type="radio"
          v-model="selectedView"
          class="btn-check"
          name="options"
          id="option1"
          autocomplete="off"
          value="1"
        />
        <label class="btn btn-outline-secondary" for="option1"
          >Vis som infokort</label
        >

        <input
          type="radio"
          v-model="selectedView"
          class="btn-check"
          name="options"
          id="option2"
          autocomplete="off"
          value="2"
        />
        <label class="btn btn-outline-secondary" for="option2"
          >Vis som liste</label
        >
        <input
          type="radio"
          v-model="selectedView"
          class="btn-check"
          name="options"
          id="option3"
          autocomplete="off"
          value="3"
        />

        <label class="btn btn-outline-secondary" for="option3"
          >Vis som trekkspilliste</label
        >
      </div>
      <select class="form-select mb-3" v-model="sortOption">
        <option value="0" disabled>Sorter etter ...</option>
        <option value="1">Pris stigende</option>
        <option value="2">Pris synkende</option>
        <option value="3">Nyeste først</option>
        <option value="4">Eldste først</option>
        <option value="5">Alfabetisk</option>
        <option value="6">Antall sengeplasser</option>
        <option value="7">Nærmest</option>
      </select>
      <div class="row">
        <div class="col-md-6">
          <div class="input-group mb-2 input-group-sm">
            <span class="input-group-text"> Sengeplasser minst </span>
            <input
              type="number"
              v-model="minCapacity"
              id="input-min-capacity"
              class="form-control"
              min="0"
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="input-group mb-2 input-group-sm">
            <span class="input-group-text"> Nærmere enn </span>
            <input
              type="number"
              min="0"
              v-model="maxDistance"
              id="input-max-distance"
              class="form-control"
            />
            <span class="input-group-text"> km </span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="input-group mb-2 input-group-sm">
            <span class="input-group-text"> Ledig fra </span>
            <input
              type="date"
              v-model="freeSelBegin"
              @input="updateFreeCabinIds()"
              :min="new Date().toISOString().slice(0, 10)"
              id="input-free-from-date"
              class="form-control"
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="input-group mb-2 input-group-sm">
            <span class="input-group-text"> Ledig til </span>
            <input
              type="date"
              v-model="freeSelEnd"
              @input="updateFreeCabinIds()"
              :min="freeSelBegin"
              id="input-free-until-date"
              class="form-control"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="input-group mb-2 input-group-sm">
            <span class="input-group-text"> Nyere enn </span>
            <input
              type="date"
              v-model="builtSelBegin"
              id="input-built-from-date"
              class="form-control"
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="input-group mb-2 input-group-sm">
            <span class="input-group-text"> Eldre enn </span>
            <input
              type="date"
              v-model="builtSelEnd"
              id="input-built-until-date"
              class="form-control"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="input-group mb-2 mb-md-0 input-group-sm">
            <span class="input-group-text"> Søk </span>
            <input
              type="text"
              v-model="searchString"
              id="input-search-name"
              class="form-control"
            />
          </div>
        </div>
        <div class="col-md-6">
          <button
            type="button"
            @click="resetFilters"
            class="btn btn-sm float-end btn-danger"
          >
            Tilbakestill
          </button>
        </div>
      </div>
    </div>
  `,
};
