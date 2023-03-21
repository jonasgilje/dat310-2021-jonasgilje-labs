const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({ selector: to.hash, behavior: "smooth" });
        }, 500);
      });
    }
  },
  routes: [
    {
      name: "index",
      path: "/",
      component: indexpageC,
    },
    {
      path: "/calendar",
      component: calendarC,
    },
    {
      path: "/cabininfo/:id",
      component: cabininfoC,
    },
    {
      path: "/login",
      component: loginpageC,
    },
    {
      path: "/mypage",
      component: mypageC,
    },
    {
      path: "/myreservations",
      component: myreservationsC,
    },
    {
      path: "/adminpage",
      component: adminpageC,
    },
    {
      name: "home",
      path: "/home",
      component: homeC,
    },
  ],
  base: "/",
});
