<template>
  <div class="auth-page">
    <h2 class="auth-page__title">
      {{
        recoveryKeypair
          ? 'auth-pages.save-recovery-seed'
          : 'auth-pages.get-started'
          | globalize
      }}
    </h2>

    <div class="auth-page__content">
      <template v-if="!recoveryKeypair">
        <signup-form
          :submit-event="'submit'"
          @submit="handleChildFormSubmit"
        />

        <div class="auth-page__tips">
          <div class="auth-page__tip">
            {{ 'auth-pages.have-an-account-question' | globalize }}
            <router-link class="auth-page__tip-link" :to="vueRoutes.login">
              {{ 'auth-pages.have-an-account-answer' | globalize }}
            </router-link>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="signup__seed-wrp">
          <p class="signup__seed-explanations">
            {{ 'auth-pages.save-recovery-seed-details' | globalize }}
          </p>

          <key-viewer
            :value="recoveryKeypair.secret()"
            :label="'auth-pages.recovery-seed' | globalize"
          />

          <div class="signup__actions">
            <button
              v-ripple
              @click="submit"
              :disabled="formMixin.isDisabled"
              class="auth-page__submit-btn"
            >
              {{ 'auth-pages.continue' | globalize }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import FormMixin from '@/vue/mixins/form.mixin'

import SignupForm from '../forms/SignupForm'
import KeyViewer from '../common/KeyViewer'

import { ErrorHandler } from '@/js/helpers/error-handler'
import { base } from '@tokend/js-sdk'
import { Sdk } from '@/sdk'
import { Api } from '@/api'
import { vueRoutes } from '@/vue-router/routes'
import { mapActions, mapGetters } from 'vuex'
import { vuexTypes } from '@/vuex'

export default {
  name: 'signup',
  components: {
    SignupForm,
    KeyViewer,
  },
  mixins: [FormMixin],
  data: _ => ({
    recoveryKeypair: null,
    password: null,
    email: null,
    vueRoutes,
  }),
  computed: {
    ...mapGetters({
      storedWallet: vuexTypes.wallet,
    }),
  },
  methods: {
    ...mapActions({
      storeWallet: vuexTypes.STORE_WALLET,
      loadAccount: vuexTypes.LOAD_ACCOUNT,
      loadKyc: vuexTypes.LOAD_KYC,
      loadKvEntriesAccountRoleIds: vuexTypes.LOAD_KV_ENTRIES_ACCOUNT_ROLE_IDS,
    }),
    handleChildFormSubmit (form) {
      this.email = form.email
      this.password = form.password
      this.recoveryKeypair = base
        .Keypair
        .random()
    },
    async submit () {
      this.disableForm()
      try {
        const { response, wallet } = await Sdk.api.wallets.create(
          this.email.toLowerCase(),
          this.password,
          this.recoveryKeypair
        )
        if (response.data.verified) {
          Sdk.sdk.useWallet(wallet)
          Api.useWallet(wallet)
          this.storeWallet(wallet)
          await this.loadAccount(this.storedWallet.accountId)
          await this.loadKyc()
          this.$router.push(vueRoutes.app)
        } else {
          this.$router.push({
            ...vueRoutes.verify,
            params: {
              paramsBase64: btoa(JSON.stringify({
                email: wallet.email.toLowerCase(),
                walletId: wallet.id,
              })),
            },
          })
        }
        this.loadKvEntriesAccountRoleIds()
      } catch (e) {
        ErrorHandler.process(e)
      }
      this.enableForm()
    },
  },
}
</script>

<style lang="scss" scoped>
@import './auth-page';

.signup__seed-wrp {
  max-width: 51rem;
}

.signup__seed-explanations {
  margin-bottom: 2rem;
}

.signup__actions {
  margin-top: 2rem;
  text-align: center;
}

</style>
