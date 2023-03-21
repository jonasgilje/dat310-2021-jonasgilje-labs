const cabininfoinputsC = {
  data() {
    return {
      selEnd: "",
      selBegin: "",
      personsAmount: 1,
      provisionsAmount: 1,
      provisionsSelectedIndex: null,
      provisionsChoices: [],
      provisionsAdded: [],
      conflictError: false,
    };
  },
  watch: {
    selEnd: function () {
      this.conflictError = false;
    },
    selBegin: function () {
      this.conflictError = false;
    },
  },
  props: ["selBegin", "selEnd", "cabinObj", "userId"],
  created: async function () {
    let response = await fetch(`/api/products/cabin/${this.cabinObj.id}`);
    if (response.status === 200) {
      const result = await response.json();
      // map to add idx (= index) for local use.
      this.provisionsChoices = result.map((el, idx) => ({ ...el, idx }));
    }
  },
  computed: {
    selectedItemAlreadyAdded: function () {
      if (this.provisionsSelectedIndex == null) return false;
      const { idx } = this.provisionsChoices[this.provisionsSelectedIndex];
      return this.provisionsAdded.map((x) => x.idx).includes(idx);
    },
    totalPrice: function () {
      const provisionsPrice = this.provisionsAdded.reduce(
        (acc, { price }) => acc + price,
        0
      );
      const duration =
        this.selBegin === ""
          ? 0
          : Math.round(
              (new Date(this.selEnd) - new Date(this.selBegin)) / 8.64e7
            ) + 1;

      const cabinPrice =
        (this.cabinObj?.price ?? 0) * duration * this.personsAmount;

      if (cabinPrice < 0) return provisionsPrice;
      return provisionsPrice + cabinPrice;
    },
  },
  methods: {
    addProvisions: function () {
      // guard clause: en produkttype må være valgt.
      if (this.provisionsSelectedIndex == null) return;
      const { id, name, price } = this.provisionsChoices[
        this.provisionsSelectedIndex
      ];
      const amount = this.provisionsAmount;
      // vil ikke legge til samme produkt to ganger
      if (this.selectedItemAlreadyAdded) {
        // tar derfor bort og legger til igjen. (event loop.)
        this.removeProvisions(idx);
      }
      this.provisionsAdded.push({
        id,
        name,
        price: price * amount,
        amount,
      });
    },
    removeProvisions: function (idx) {
      // finner og tar bort raden med gitt id
      this.provisionsAdded.splice(
        this.provisionsAdded.indexOf(
          this.provisionsAdded.find((x) => x.idx === idx)
        ),
        1
      );
    },
    sendReservation: async function () {
      // do checking.
      let response = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservedBy: this.userId ?? null,
          startDate: this.selBegin,
          endDate: this.selEnd,
          persons: this.personsAmount,
          price: this.totalPrice,
          cabinId: this.cabinObj.id,
          provisionsJson: JSON.stringify(this.provisionsAdded),
        }),
      });
      if (response.status === 201) {
        location.reload();
      } else if (response.status === 409) {
        this.conflictError = true;
      }
    },
  },
  template: html`
    <div>
      <div class="input-group mb-3 input-group-sm">
        <span class="input-group-text" id="input-from-date-desc">Fra dato</span>
        <input
          type="date"
          @input="$emit('update:selBegin', selBegin)"
          v-model="selBegin"
          :max="selEnd"
          id="input-from-date"
          class="form-control"
        />
      </div>
      <div class="input-group mb-3 input-group-sm">
        <span class="input-group-text" id="input-to-date-desc">Til dato</span>
        <input
          type="date"
          @input="$emit('update:selEnd', selEnd)"
          v-model="selEnd"
          :min="selBegin"
          id="input-to-date"
          class="form-control"
        />
      </div>
      <div class="input-group mb-3 input-group-sm">
        <span class="input-group-text" id="input-persons-desc">Personer</span>
        <input
          type="number"
          min="1"
          value="1"
          :max="cabinObj?.capacity ?? 1"
          v-model="personsAmount"
          id="input-persons"
          class="form-control"
        />
      </div>
      <div
        :class="[provisionsAdded.length ? 'mb-2': 'mb-3', 'input-group', 'input-group-sm']"
      >
        <span class="input-group-text" id="input-add-provisions-desc">
          Proviant
        </span>
        <div class="provisions-amount-input-div input-group-sm">
          <input
            type="number"
            min="1"
            v-model="provisionsAmount"
            :size="provisionsChoices[provisionsSelectedIndex]?.amount.toString().length ?? 1"
            value="1"
            :max="provisionsChoices[provisionsSelectedIndex]?.amount ?? 1"
            id="input-provisions-amount"
            class="form-control rounded-0"
          />
        </div>
        <select
          v-model="provisionsSelectedIndex"
          class="form-select"
          id="inputGroupSelect04"
        >
          <option selected disabled>Velg et produkt ...</option>
          <option v-for="(item, idx) in provisionsChoices" :value="idx">
            {{item.name}} {{item.price | priceNOK}} ({{item.amount}})
          </option>
        </select>
        <button
          class="btn btn-outline-secondary"
          @click="addProvisions()"
          type="button"
          style="line-height:0;"
        >
          <i
            :class="['bi', selectedItemAlreadyAdded ? 'bi-pencil-fill' : 'bi-cart-plus-fill']"
          ></i>
        </button>
      </div>
      <table v-if="provisionsAdded.length" class="table">
        <thead>
          <tr>
            <th scope="col">Produkt</th>
            <th scope="col">Antall</th>
            <th scope="col">Pris</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in provisionsAdded">
            <td>{{item.name}}</td>
            <td>{{item.amount}}</td>
            <td>{{item.price}}</td>
            <td @click="removeProvisions(item.idx)">
              <div class="d-flex pr-2 justify-content-end">
                <i class="bi bi-x-lg" style="cursor:pointer;"></i>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <alertmessage
        v-else
        :alert-message="{type:'alert-primary', text:'Det er foreløpig ikke lagt til proviant.'}"
      ></alertmessage>
      <div class="mt-4 d-flex flex-wrap justify-content-between">
        <button
          class="btn btn-primary me-2"
          type="submit"
          @click.stop.prevent="sendReservation"
        >
          Send inn reservasjon
        </button>
        <div
          class="input-group-text pe-2"
          style="border-color:transparent;background-color:transparent;font-weight:600;"
        >
          i alt {{totalPrice | priceNOK }}
        </div>
      </div>
      <alertmessage
        v-if="conflictError"
        :alert-message="{type:'alert-danger', text:'Motstridende data. Pass på at datoene er ledige.'}"
      ></alertmessage>
    </div>
  `,
};
