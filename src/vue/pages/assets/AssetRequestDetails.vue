<template>
  <div class="asset-request-details">
    <div class="asset-details">
      <asset-logo
        :asset-code="request.assetCode"
        :logo-url="request.logoUrl(config.FILE_STORAGE)"
      />
      <div class="asset-details__info">
        <p class="asset-details__code">
          {{ request.assetCode }}
        </p>
        <p class="asset-details__name">
          {{ request.assetName }}
        </p>
      </div>
    </div>
    <div
      v-if="request.isApproved"
      class="request-state request-state--approved"
    >
      <p class="request-state__content">
        {{ 'asset-request-details.approved-request-msg' | globalize }}
      </p>
    </div>
    <div
      v-else-if="request.isPending"
      class="request-state request-state--pending"
    >
      <p class="request-state__content">
        {{ 'asset-request-details.pending-request-msg' | globalize }}
      </p>
    </div>
    <div
      v-else-if="request.isRejected"
      class="request-state request-state--rejected"
    >
      <p class="request-state__content">
        <!-- eslint-disable-next-line max-len -->
        {{ 'asset-request-details.rejected-request-msg' | globalize({ reason: request.rejectReason }) }}
      </p>
    </div>
    <div
      v-else-if="request.isCanceled"
      class="request-state request-state--canceled"
    >
      <p class="request-state__content">
        {{ 'asset-request-details.canceled-request-msg' | globalize() }}
      </p>
    </div>
    <div
      v-else-if="request.isPermanentlyRejected"
      class="request-state request-state--permanently-rejected"
    >
      <p class="request-state__content">
        <!-- eslint-disable-next-line max-len -->
        {{ 'asset-request-details.permanently-rejected-request-msg' | globalize({ reason: request.rejectReason }) }}
      </p>
    </div>
    <table class="app__table asset-request-details__table">
      <tbody>
        <tr>
          <td>
            {{ 'asset-request-details.request-type-title' | globalize }}
          </td>
          <td>
            <template v-if="request.requestTypeI === REQUEST_TYPES.assetCreate">
              <!-- eslint-disable-next-line max-len -->
              {{ 'asset-request-details.asset-create-request-type' | globalize }}
            </template>
            <template v-else>
              <!-- eslint-disable-next-line max-len -->
              {{ 'asset-request-details.asset-update-request-type' | globalize }}
            </template>
          </td>
        </tr>
        <tr v-if="request.requestTypeI === REQUEST_TYPES.assetCreate">
          <td>
            {{ 'asset-request-details.max-issuance-amount-title' | globalize }}
          </td>
          <td>
            {{ request.maxIssuanceAmount | formatMoney }}
          </td>
        </tr>
        <tr v-if="request.requestTypeI === REQUEST_TYPES.assetCreate">
          <td>
            <!-- eslint-disable-next-line max-len -->
            {{ 'asset-request-details.initial-preissued-amount-title' | globalize }}
          </td>
          <td>
            {{ request.initialPreissuedAmount | formatMoney }}
          </td>
        </tr>
        <tr>
          <td>
            {{ 'asset-request-details.terms-title' | globalize }}
          </td>
          <td>
            <a
              v-if="request.termsKey"
              class="asset-request-details__terms"
              :href="assetTermsUrl"
            >
              {{ 'asset-request-details.download-terms-btn' | globalize }}
            </a>
            <p v-else>
              {{ 'asset-request-details.no-terms-msg' | globalize }}
            </p>
          </td>
        </tr>
        <tr>
          <td>
            {{ 'asset-request-details.transferable-title' | globalize }}
          </td>
          <td>
            <template v-if="request.isTransferable">
              {{ 'asset-request-details.present-msg' | globalize }}
            </template>
            <template v-else>
              {{ 'asset-request-details.absent-msg' | globalize }}
            </template>
          </td>
        </tr>
        <tr>
          <td>
            {{ 'asset-request-details.requires-kyc-title' | globalize }}
          </td>
          <td>
            <template v-if="request.isRequiresKYC">
              {{ 'asset-request-details.present-msg' | globalize }}
            </template>
            <template v-else>
              {{ 'asset-request-details.absent-msg' | globalize }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="asset-request-details__buttons">
      <button
        v-ripple
        class="asset-request-details__update-btn"
        :disabled="!canBeUpdated"
        @click="$emit(EVENTS.update)"
      >
        {{ 'asset-request-details.update-btn' | globalize }}
      </button>
      <button
        v-ripple
        class="asset-request-details__cancel-btn"
        :class="{
          'asset-request-details__cancel-btn--disabled': !canBeCanceled
        }"
        :disabled="!canBeCanceled"
        @click="$emit(EVENTS.cancel)"
      >
        {{ 'asset-request-details.cancel-btn' | globalize }}
      </button>
    </div>
  </div>
</template>

<script>
import AssetLogo from '@/vue/common/assets/AssetLogo'

import { ASSET_POLICIES, REQUEST_TYPES } from '@tokend/js-sdk'

import { REQUEST_STATES } from '@/js/const/request-states.const'

import config from '@/config'

import { AssetCreateRequestRecord } from '@/js/records/requests/asset-create.record'
import { AssetUpdateRequestRecord } from '@/js/records/requests/asset-update.record'

const EVENTS = {
  update: 'update',
  cancel: 'cancel',
}

export default {
  name: 'asset-request-details',
  components: {
    AssetLogo,
  },
  props: {
    request: {
      type: [AssetCreateRequestRecord, AssetUpdateRequestRecord],
      required: true,
    },
  },
  data: _ => ({
    config,
    ASSET_POLICIES,
    EVENTS,
    REQUEST_STATES,
    REQUEST_TYPES,
  }),
  computed: {
    assetTermsUrl () {
      return this.request.termsUrl(config.FILE_STORAGE)
    },
    canBeUpdated () {
      return this.request.isPending || this.request.isRejected
    },
    canBeCanceled () {
      return this.request.isPending
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@scss/variables";
@import "~@scss/mixins";

.request-state {
  min-height: 6.4rem;
  width: 100%;
  margin-top: 2rem;
  display: none;

  .request-state__content {
    padding: 2.4rem;
    font-size: 1.3rem;
    font-weight: normal;
    color: $col-primary-txt;
  }

  @mixin apply-theme ($col-msg-background) {
    background-color: $col-msg-background;
    display: block;
  }

  &--approved { @include apply-theme($col-request-approved) }
  &--pending { @include apply-theme($col-request-pending) }
  &--rejected, &--canceled, &--permanently-rejected {
    @include apply-theme($col-request-rejected)
  }
}

.asset-request-details__table {
  margin-top: 2rem;

  tr td:last-child {
    text-align: right;
  }
}

.asset-request-details__terms {
  font-size: 1.4rem;
  color: $col-primary-lighten;
  text-decoration: none;

  &:visited {
    color: $col-primary-lighten;
  }
}

.asset-request-details__buttons {
  margin-top: 4.9rem;
  display: flex;

  button + button {
    margin-left: auto;
  }
}

.asset-request-details__update-btn {
  @include button-raised();

  margin-bottom: 2rem;
  width: 18rem;
}

.asset-request-details__cancel-btn {
  @include button();

  padding-left: .1rem;
  padding-right: .1rem;
  margin-bottom: 2rem;
  font-weight: normal;

  &--disabled {
    filter: grayscale(100%);
    cursor: default;
  }
}

.asset-details {
  display: flex;
  align-items: center;

  .asset-details__logo {
    width: 5rem;
    height: 5rem;
    border-radius: 50%
  }

  .asset-details__info {
    margin-left: 1.8rem;

    .asset-details__code {
      font-size: 1.8rem;
      font-weight: bold;
      color: $col-primary;
    }

    .asset-details__name {
      margin-top: .1rem;
      font-size: 1.4rem;
      line-height: 1.29;
      color: $col-primary;
    }
  }
}
</style>