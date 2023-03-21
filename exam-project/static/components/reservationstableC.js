const reservationstableC = {
  props: ["reservations", "showDeleteColumn"],
  filters: {
    formatStatus: function (reservation) {
      return `${reservation.verified ? "Bekreftet" : "Ubekreftet"}, 
                  betaling ${reservation.paidFor ? "" : "ikke"} registrert.`;
    },
  },
  methods: {
    rowContextualClass: function (reservation) {
      if (new Date(reservation.endDate) < new Date()) {
        return ["bg-secondary", "text-white"];
      } else if (reservation.verified && reservation.paidFor) {
        return ["bg-success", "text-white"];
      }
      return [];
    },

    deleteReservation: async function (value) {
      const response = await fetch(`/api/reservation/${value}`, {
        method: "DELETE",
      });
      if (response.ok) location.reload();
    },
  },
  template: html`<div>
    <div class="table-responsive-lg" v-if="reservations?.length">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Status</th>
            <th scope="col">Hyttenavn</th>
            <th scope="col">Innsendt</th>
            <th scope="col">Fra</th>
            <th scope="col">Til</th>
            <th scope="col">Personer</th>
            <th scope="col">Proviant</th>
            <th scope="col">Totalpris</th>
            <th scope="col" v-if="showDeleteColumn"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reservation in reservations"
            :class="rowContextualClass(reservation)"
          >
            <td>{{reservation.id}}</td>
            <td>{{reservation | formatStatus }}</td>
            <td>{{reservation.cabinName}}</td>
            <td>{{reservation.regDate}}</td>
            <td>{{reservation.startDate}}</td>
            <td>{{reservation.endDate}}</td>
            <td>{{reservation.persons}}</td>
            <td v-if="reservation.provisionsJson == '[]'">Ingen</td>
            <td v-else>
              <ul>
                <li v-for="item in JSON.parse(reservation.provisionsJson)">
                  {{item.name}} ({{item.amount}})
                </li>
              </ul>
            </td>
            <td>{{reservation.totalPrice | priceNOK }}</td>
            <td v-if="showDeleteColumn">
              <button
                class="btn btn-danger border-light"
                @click="deleteReservation(reservation.id)"
              >
                Slett
              </button>
            </td>
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
};
