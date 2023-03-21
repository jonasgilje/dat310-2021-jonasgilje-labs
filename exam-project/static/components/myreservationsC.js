const myreservationsC = {
  data() {
    return {
      myReservations: null,
    };
  },
  created: async function () {
    // vent til loggedInUser er definert (trengs ved refresh.)
    while (this.$root.loggedInUser == null)
      await new Promise((r) => setTimeout(r, 100));
    let response = await fetch(
      `/api/reservation/user/${this.$root.loggedInUser.id}`
    );
    if (response.ok) {
      const result = await response.json();
      this.myReservations = result;
    }
  },
  template: html`<div class="container">
    <h1 class="h2">Mine reservasjoner</h1>
    <reservationstable
      :reservations="myReservations"
      :showDeleteColumn="true"
      v-if="myReservations"
    ></reservationstable>
  </div>`,
};
