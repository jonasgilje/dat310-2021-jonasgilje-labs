class Card {
  constructor(id, img) {
    this.id = id;
    this.img = img;
    this.flipped = false;
    this.matched = false;
    this.size = 480 / SIZE;
  }
}

const SIZE = 6;
const NUMOFIMG = 37;

const quizBank = Array.from(new Array(NUMOFIMG), (_, i) => `img/${i + 1}.png`);

const cardC = {
  props: ["card"], // visibility: card.matched? 'hidden': 'visible',
  template: /*html*/ `
    <div class="outer" v-on:click="$emit('flip')" 
        v-bind:style="{  width: card.size + 'px', height: card.size + 'px'}"
        >
        <div class="card front" v-bind:style="{ transform: card.flipped? 'rotateY(180deg)': 'none' }">
            <img v-bind:src="card.img">
        </div>
        <div class="card back" v-bind:style="{ transform: card.flipped? 'rotateY(180deg)': 'none' }"></div>
    </div>
    `,
};

const counterC = {
  props: ["score", "active", "text"],
  template: /*html*/ `
    <div class="counter-text">
        {{text}}
        <span class="counter" v-bind:style="{ borderColor: active ? 'red' : 'black' }">
            {{score}}
        </span>
    </div>
    `,
};

const timerC = {
  props: ["flips", "start", "active"], // active: !showResetButton
  template: /*html*/ `
    <div class="timer">
        {{minutes.toString().padStart(2, "0")}}:{{seconds.toString().padStart(2, "0")}}
        <br>Flips: {{flips}}
    </div>
    `,
  data: () => {
    return {
      timeElapsed: null,
    };
  },
  computed: {
    seconds() {
      return Math.floor((this.timeElapsed / 1000) % 60);
    },
    minutes() {
      return Math.floor(this.timeElapsed / (1000 * 60));
    },
  },
  mounted() {
    this.updateTime();
  },
  methods: {
    updateTime() {
      if (this.active) {
        this.timeElapsed = Date.parse(new Date()) - Date.parse(this.start);
      }
      setTimeout(this.updateTime, 1000);
    },
  },
};

const resetC = {
  template: /*html*/ `
    <div class="reset-button" v-on:click="startNew">
        Start new game
    </div>
    `,
  methods: {
    startNew() {
      this.$root.showResetButton = false;
      this.$root.resetGame();
    },
  },
};

const app = Vue.createApp({
  data: () => {
    return {
      cards: generateCardArray(),
      firstPlayersTurn: Math.random() < 0.5,
      score: [0, 0],
      flipCount: 0,
      showResetButton: false,
      startTime: new Date(),
      lastFlipped: null,
    };
  },
  methods: {
    flip(card) {
      if (card.matched) return;
      if (card === this.lastFlipped) return;
      card.flipped = true;
      this.flipCount++;
      if (this.lastFlipped === null) {
        this.lastFlipped = card;
      } else if (this.lastFlipped.id === card.id) {
        this.lastFlipped.matched = true;
        card.matched = true;
        this.lastFlipped = null;
        // increment count of current player
        this.score[this.firstPlayersTurn ? 0 : 1]++;
        this.checkGameFinished();
      } else {
        this.flipBack(this.lastFlipped);
        this.flipBack(card);
        this.lastFlipped = null;
        // make it the other player's turn
        this.firstPlayersTurn = !this.firstPlayersTurn;
      }
    },
    flipBack(card) {
      // flip the card back, after some timeout
      setTimeout(() => {
        if (card.matched) return; // makes matched cards not flip back
        if (card === this.lastFlipped) return; // fixes a "phantom flip" bug
        card.flipped = false;
      }, 800);
    },
    checkGameFinished() {
      if (this.cards.filter((x) => !x.matched).length) return;
      this.showResetButton = true;
      setTimeout(() => {
        alert(
          {
            "-1": "Player 2 has won!",
            0: "It's a tie!",
            1: "Player 1 has won!",
          }[Math.sign(this.score[0] - this.score[1])]
        );
      }, 400);
    },
    resetGame() {
      this.lastFlipped = null;
      this.startTime = new Date();
      this.flipCount = 0;
      this.score = [0, 0];
      this.firstPlayersTurn = Math.random() < 0.5;
      this.cards = generateCardArray();
      const imgs = this.cards.map((x) => x.img);
      this.cards.forEach((card) => (card.img = "img/blank.png")); // safe bc. event loop.
      setTimeout(() => {
        this.cards.forEach((card, idx) => (card.img = imgs[idx]));
      }, 600); // hide cards so as to not reveal them while flipping back
    },
  },
});

app.component("card", cardC);
app.component("counter", counterC);
app.component("timer", timerC);
app.component("reset", resetC);
app.mount("#app");

function generateCardArray() {
  function shuffleArray(array) {
    const returnArray = [];

    for (const element of array) {
      returnArray.push([element, Math.random()]);
    }

    returnArray.sort((left, right) => left[1] - right[1]);

    return returnArray.map((x) => x[0]);
  }

  let cardArray = [];

  const quizBankPartition = shuffleArray(quizBank).slice(0, (SIZE * SIZE) / 2);

  for (const [idx, img] of quizBankPartition.entries()) {
    cardArray.push(new Card(idx, img));
    cardArray.push(new Card(idx, img));
  }

  cardArray = shuffleArray(cardArray);

  return cardArray;
}
