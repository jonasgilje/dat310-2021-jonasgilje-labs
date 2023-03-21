const alertmessageC = {
  props: ["alertMessage"],
  template: html`
    <div
      v-if="alertMessage"
      class="mt-3 py-1 px-2 alert d-flex align-items-center"
      :class="[alertMessage.type]"
      role="alert"
    >
      <div class="me-2">
        <i
          class="bi bi-check-circle-fill"
          v-if="alertMessage.type == 'alert-success'"
        ></i>
        <i
          class="bi bi-exclamation-triangle-fill"
          v-else-if="alertMessage.type == 'alert-danger'"
        ></i>
        <i
          class="bi bi-exclamation-triangle-fill"
          v-else-if="alertMessage.type == 'alert-warning'"
        ></i>
        <i
          class="bi bi-info-circle-fill"
          v-else-if="alertMessage.type == 'alert-primary'"
        ></i>
      </div>
      <small>{{alertMessage.text}}</small>
    </div>
  `,
};
