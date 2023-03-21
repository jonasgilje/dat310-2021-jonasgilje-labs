const cabincardC = {
  data() {
    return {
      reservations: [],
    };
  },
  props: ["cabinObj"],
  computed: {
    norgeskartURL: function () {
      return (
        "https://www.norgeskart.no/#!?project=norgeskart&sok=" +
        encodeURI(this.location)
      );
    },
  },
  created: async function () {},
  template: html`
    <div class="col-md-4 col-sm-6">
      <div class="card mb-4 mx-auto">
        <img
          class="card-img-top"
          :src="'/static/img/'+cabinObj.imageURL"
          alt="Card image cap"
        />
        <div class="card-body">
          <h5 class="card-title">{{cabinObj.name}}</h5>
          <ul class="my-3">
            <li v-if="$root.loggedInUser?.isAdmin">
              <strong>Hytte-ID:</strong> {{cabinObj.id}}
            </li>
            <li>
              <strong>Oppført:</strong> {{new
              Date(cabinObj.buildDate).toLocaleString("nb-no", {day: "numeric",
              month:"long", year:"numeric"})}}
            </li>
            <li>
              <strong>Koordinater:</strong>
              <a
                target="_blank"
                :href="'https://www.norgeskart.no/#!?project=norgeskart&zoom=10&sok=' + encodeURI(cabinObj.location)"
                >{{cabinObj.location}}</a
              >
            </li>
            <li><strong>Sengeplasser:</strong> {{cabinObj.capacity}}</li>
            <li v-if="cabinObj.distance != null">
              <strong>Avstand fra meg:</strong> {{cabinObj.distance}} km
            </li>
            <li>
              <strong>Pris per natt:</strong> {{cabinObj.price | priceNOK}}
            </li>
          </ul>

          <div class="btn-group" role="group" aria-label="Go to cabin info">
            <router-link
              :to="'/cabininfo/' + cabinObj.id"
              class="btn btn-primary"
              >Mer info</router-link
            >
            <router-link
              v-if="$root.loggedInUser"
              :to="'/cabininfo/' + cabinObj.id + '#booking-anchor'"
              class="btn btn-outline-success"
              >Reserver</router-link
            >
          </div>
        </div>
      </div>
    </div>
  `,
};
