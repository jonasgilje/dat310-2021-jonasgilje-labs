Vue.component("v-calendar", calendarC);
Vue.component("nav-bar", navbarC);
Vue.component("cabincard", cabincardC);
Vue.component("home", homeC);
Vue.component("cabininfo", cabininfoC);
Vue.component("cabininfoinputs", cabininfoinputsC);
Vue.component("loginpage", loginpageC);
Vue.component("mypage", mypageC);
Vue.component("indexpage", indexpageC);
Vue.component("adminpage", adminpageC);
Vue.component("reservationstable", reservationstableC);
Vue.component("cabinfilters", cabinfiltersC);
Vue.component("alertmessage", alertmessageC);
Vue.component("myreservations", myreservationsC);

Vue.filter("priceNOK", (value) => {
  if (value == null) return "";
  return `kr ${Math.round(value).toLocaleString("nb-no")},-`;
});

//Vue.use(Vuex);

new Vue({
  data() {
    return {
      loggedInUser: null,
    };
  },
  created: async function () {
    let response = await fetch("/api/login");
    if (response.status === 200) {
      const user = await response.json();
      this.loggedInUser = user;
    }
  },
  el: "#app",
  router: router,
});
