<template>
  <div>
    <section
      id="authentication"
      class="row justify-content-center align-items-center"
    >
      <div id="container-auth">
        <FormLogin></FormLogin>
      </div>
    </section>
  </div>
</template>

<script>
import FormLogin from '../components/FormLogin'
export default {
  name: 'Login',
  created() {},
  data() {
    return {}
  },
  components: {
    FormLogin,
  },
  methods: {
    toggleLoginForm() {
      this.isLoginForm = !this.isLoginForm
    },
    onSignIn(googleUser) {
      this.$store.dispatch('onSignIn', googleUser)
    },

    showMessage(payload) {
      this.$emit('showMessage', payload)
    },
    changePage(payload) {
      this.$emit('changePage', payload)
    },
  },
}
</script>

<style></style>
