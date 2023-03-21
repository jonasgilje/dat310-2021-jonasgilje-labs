const cabininfoC = {
  data() {
    return {
      cabinObj: null,
      reservations: [],
      imageURL: "",
      selEnd: "",
      selBegin: "",
      myReservations: [],
    };
  },
  created: async function () {
    let response = await fetch(`/api/cabin/${this.$route.params.id}`);
    if (response.ok) {
      let result = await response.json();
      this.cabinObj = result?.[0];
      this.imageURL =
        this.cabinObj != null ? "/static/img/" + this.cabinObj.imageURL : "";
    }
    if (this.$root.loggedInUser != null) {
      response = await fetch(`/api/reservation/cabin/${this.$route.params.id}`);
      if (response.ok) {
        let result = await response.json();
        this.reservations = result;
      }

      response = await fetch(
        `/api/reservation/cabin/${this.$route.params.id}/user/${this.$root.loggedInUser.id}`
      );
      if (response.ok) {
        const result = await response.json();
        this.myReservations = result;
      }
    }
  },
  template: html`
    <div class="container">
      <div class="row">
        <div class="col-md-7 mb-3">
          <img class="rounded img-fluid" :src="imageURL" />
        </div>
        <div class="col-md-5">
          <h1 class="display-5">{{cabinObj?.name}}</h1>
          <ul class="my-3">
            <li>
              <strong>Oppført:</strong> {{new
              Date(cabinObj?.buildDate).toLocaleString("nb-no", {day: "numeric",
              month:"long", year:"numeric"})}}
            </li>
            <li>
              <strong>Koordinater:</strong>
              <a
                target="_blank"
                :href="'https://www.norgeskart.no/#!?project=norgeskart&zoom=9&sok=' + encodeURI(cabinObj?.location)"
                >{{cabinObj?.location}}</a
              >
            </li>
            <li>
              <strong>Veibeskrivelse:</strong>
              <a
                target="_blank"
                :href="'https://www.google.com/maps/dir/?api=1&destination=' + encodeURI(cabinObj?.location)"
              >
                Google Maps
              </a>
            </li>
            <li><strong>Sengeplasser:</strong> {{cabinObj?.capacity}}</li>
            <li>
              <strong>Pris per natt:</strong> {{cabinObj?.price | priceNOK }}
            </li>
          </ul>
        </div>
      </div>
      <hr />
      <div v-if="$root.loggedInUser">
        <div class="row" id="booking-anchor">
          <div class="col-xs-12 col-lg-3">
            <h2>Reserver</h2>
            <p>
              <small>
                Trykk i kalenderen for å velge fra- og til-datoer. Valgte datoer
                vises i blå farge. Røde datoer er opptatt.
              </small>
            </p>
          </div>
          <div class="col-xs-12 col-lg-4 col-sm-6">
            <v-calendar
              :reservations="reservations"
              :selBegin.sync="selBegin"
              :selEnd.sync="selEnd"
              class="mx-auto mb-3"
            ></v-calendar>
          </div>

          <div class="col-xs-12 col-lg-5 col-sm-6">
            <cabininfoinputs
              :selBegin.sync="selBegin"
              :selEnd.sync="selEnd"
              :cabinObj="cabinObj"
              v-if="cabinObj"
            ></cabininfoinputs>
          </div>
        </div>
        <hr />
        <div class="row">
          <h2>Mine reservasjoner</h2>
          <reservationstable :reservations="myReservations"></reservationstable>
        </div>
      </div>
      <div class="row" id="booking-anchor" v-else>
        <alertmessage
          class="col alertmessage-gutter-fix"
          :alert-message="{type:'alert-primary',text:'Du må være innlogget for å kunne sende inn reservasjon.'}"
        ></alertmessage>
      </div>
    </div>
  `,
};
