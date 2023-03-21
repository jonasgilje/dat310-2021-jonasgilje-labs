const calendarC = {
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      firstSelect: true,
    };
  },
  props: ["reservations", "selBegin", "selEnd"],
  methods: {
    previous: function () {
      if (this.currentMonth === 0) --this.currentYear;
      this.currentMonth = (this.currentMonth + 11) % 12;
    },
    next: function () {
      if (this.currentMonth === 11) ++this.currentYear;
      this.currentMonth = (this.currentMonth + 1) % 12;
    },
    selectDate: function (day) {
      if (this.firstSelect) {
        this.selBegin = this.isoString(day);
        this.$emit("update:selBegin", this.selBegin);
      }
      const newSelEnd = this.isoString(day);
      // Sjekke at til-dato ikke kommer før fra-dato
      if (!this.firstSelect && new Date(newSelEnd) < new Date(this.selBegin)) {
        this.firstSelect = true;
        this.selectDate(day);
        return;
      }
      this.selEnd = this.isoString(day);
      this.$emit("update:selEnd", this.selEnd);
      this.firstSelect = !this.firstSelect;
    },
    isoString: function (day) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const isoString = new Date(date - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      return isoString;
    },
    dateClassObj: function (day) {
      const isoString = this.isoString(day);
      const today = new Date();
      const isSelected =
        new Date(this.selBegin) <= new Date(isoString) &&
        new Date(isoString) <= new Date(this.selEnd);
      const isOccupied = this.occDates.includes(isoString);
      const isToday =
        day === today.getDate() &&
        this.currentMonth === today.getMonth() &&
        this.currentYear === today.getFullYear();

      return {
        "calendar-date-sel": isSelected,
        "calendar-date-occ": isOccupied,
        "calendar-date-today": isToday,
      };
    },
  },
  computed: {
    occDates: function () {
      if (this.reservations == null) return [];
      const list = [];
      for (let { startDate, endDate } of this.reservations) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        while (startDate <= endDate) {
          list.push(startDate.toISOString().slice(0, 10));
          startDate.setDate(startDate.getDate() + 1);
        }
      }

      return list;
    },
    currentDate: function () {
      // nåværende måned i kalendervisning. hvis man trenger dato i dag, brukes new Date().
      return new Date(this.currentYear, this.currentMonth, 1);
    },
    topBarDate: function () {
      return this.currentDate.toLocaleString("nb-no", {
        month: "long",
        year: "numeric",
      });
    },
    prePadding: function () {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      // man - søn: [1, 2, 3, 4, 5, 6, 0]
      const firstDay = new Date(year, month, 1).getDay();
      return (firstDay + 6) % 7; // justere for søndag første dag.
    },

    monthDays: function () {
      const year = this.currentDate.getFullYear();
      // jan: 0, feb: 1, ...
      const month = this.currentDate.getMonth();
      // henter datoen til dagen før første dag neste måned.
      return new Date(year, month + 1, 0).getDate();
    },

    postPadding: function () {
      return 42 - this.prePadding - this.monthDays;
    },
  },
  template: html` <div class="calendar-flex-container">
    <div class="calendar-top-bar">
      <span v-on:click="previous()"> < </span>
      <span>{{topBarDate}} </span>
      <span v-on:click="next()"> > </span>
    </div>
    <div v-for="day in 'MTOTFLS'" class="calendar-date calendar-heading">
      {{day}}
    </div>
    <div class="calendar-hr"></div>
    <div v-for="n in prePadding" class="calendar-date"></div>

    <div
      v-for="n in monthDays"
      :class="[dateClassObj(n), 'calendar-date']"
      v-on:click="selectDate(n)"
    >
      {{n}}
    </div>
    <div v-for="n in postPadding" class="calendar-date"></div>
  </div>`,
};
