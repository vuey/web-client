<template>
  <div class="asset-creation-requests">
    <template v-if="isLoaded">
      <template v-if="requestsHistory.length">
        <drawer :is-shown.sync="isDetailsDrawerShown">
          <template v-if="isUpdateMode">
            <template slot="heading">
              {{ 'asset-creation-requests.update-asset-title' | globalize }}
            </template>

            <asset-create-form
              v-if="isAssetCreateRequestSelected"
              :request="selectedRequest"
              @request-updated="closeDetailsDrawer() || initFirstPageLoader()"
              @close="closeDetailsDrawer"
            />

            <asset-update-form
              v-else
              :request="selectedRequest"
              :asset-for-update="selectedRequest.assetCode"
              @request-updated="closeDetailsDrawer() || initFirstPageLoader()"
              @close="closeDetailsDrawer"
            />
          </template>

          <template v-else>
            <template slot="heading">
              {{ 'asset-creation-requests.details-title' | globalize }}
            </template>

            <asset-request-details
              :request="selectedRequest"
              :is-pending="isRequestCancelling"
              @update="isUpdateMode = true"
              @cancel="cancelRequest"
            />
          </template>
        </drawer>

        <div
          class="app__table
                app__table--with-shadow
                asset-creation-requests__table"
        >
          <table>
            <thead>
              <tr>
                <!-- eslint-disable max-len -->
                <th :title="'asset-creation-requests.asset-code-header' | globalize">
                  {{ 'asset-creation-requests.asset-code-header' | globalize }}
                </th>
                <th :title="'asset-creation-requests.request-state-header' | globalize">
                  {{ 'asset-creation-requests.request-state-header' | globalize }}
                </th>
                <th :title="'asset-creation-requests.created-header' | globalize">
                  {{ 'asset-creation-requests.created-header' | globalize }}
                </th>
                <th :title="'asset-creation-requests.last-updated-header' | globalize">
                  {{ 'asset-creation-requests.last-updated-header' | globalize }}
                </th>
                <!-- eslint-enable max-len -->
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(request, index) in requestsHistory"
                :key="index"
              >
                <td :title="request.assetCode">
                  {{ request.assetCode }}
                </td>

                <td
                  v-if="request.isApproved"
                  class="request-state request-state--approved"
                  :title="'request-states.approved-state' | globalize"
                >
                  {{ 'request-states.approved-state' | globalize }}
                </td>

                <td
                  v-if="request.isPending"
                  class="request-state request-state--pending"
                  :title="'request-states.pending-state' | globalize"
                >
                  {{ 'request-states.pending-state' | globalize }}
                </td>

                <td
                  v-if="request.isRejected"
                  class="request-state request-state--rejected"
                  :title="'request-states.rejected-state' | globalize"
                >
                  {{ 'request-states.rejected-state' | globalize }}
                </td>

                <td
                  v-if="request.isCanceled"
                  class="request-state request-state--canceled"
                  :title="'request-states.canceled-state' | globalize"
                >
                  {{ 'request-states.canceled-state' | globalize }}
                </td>

                <!-- eslint-disable max-len -->
                <td
                  v-if="request.isPermanentlyRejected"
                  class="request-state request-state--permanently-rejected"
                  :title="'request-states.permanently-rejected-state' | globalize"
                >
                  {{ 'request-states.permanently-rejected-state' | globalize }}
                </td>
                <!-- eslint-enable max-len -->

                <td :title="request.createdAt | formatCalendar">
                  {{ request.createdAt | formatCalendar }}
                </td>

                <td :title="request.updatedAt | formatCalendar">
                  {{ request.updatedAt | formatCalendar }}
                </td>

                <td>
                  <a
                    class="request-details-btn"
                    @click="showRequestDetails(index)"
                  >
                    {{ 'asset-creation-requests.details-btn' | globalize }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <!-- eslint-disable max-len -->
        <no-data-message
          icon-name="trending-up"
          title-id="asset-creation-requests.no-request-history-title"
          message-id="asset-creation-requests.no-request-history-desc"
        />
        <!-- eslint-enable max-len -->
      </template>
    </template>

    <template v-else-if="!isLoadingFailed">
      <loader message-id="asset-creation-requests.loading-msg" />
    </template>

    <template v-else>
      <p>
        {{ 'asset-creation-requests.loading-error-msg' | globalize }}
      </p>
    </template>

    <collection-loader
      class="asset-creation-requests__loader"
      v-show="requestsHistory.length"
      :first-page-loader="firstPageLoader"
      @first-page-load="setHistory"
      @next-page-load="extendHistory"
      @error="isLoadingFailed = true"
    />
  </div>
</template>

<script>
import Loader from '@/vue/common/Loader'
import Drawer from '@/vue/common/Drawer'
import NoDataMessage from '@/vue/common/NoDataMessage'
import CollectionLoader from '@/vue/common/CollectionLoader'

import AssetRequestDetails from '@/vue/pages/assets/AssetRequestDetails'
import AssetCreateForm from '@/vue/forms/AssetCreateForm'
import AssetUpdateForm from '@/vue/forms/AssetUpdateForm'

import { Sdk } from '@/sdk'
import { base } from '@tokend/js-sdk'

import { AssetCreateRequestRecord } from '@/js/records/requests/asset-create.record'
import { RecordWrapper } from '@/js/records'

import { mapGetters } from 'vuex'
import { vuexTypes } from '@/vuex'

import { Bus } from '@/js/helpers/event-bus'
import { ErrorHandler } from '@/js/helpers/error-handler'

export default {
  name: 'asset-creation-requests',
  components: {
    Loader,
    Drawer,
    NoDataMessage,
    CollectionLoader,
    AssetRequestDetails,
    AssetCreateForm,
    AssetUpdateForm,
  },

  data: _ => ({
    requestsHistory: [],
    isLoaded: false,
    isLoadingFailed: false,
    isDetailsDrawerShown: false,
    selectedIndex: -1,
    isUpdateMode: false,
    isRequestCancelling: false,
    firstPageLoader: () => {},
  }),

  computed: {
    ...mapGetters({
      accountId: vuexTypes.accountId,
    }),

    selectedRequest () {
      return this.requestsHistory[this.selectedIndex]
    },

    isAssetCreateRequestSelected () {
      return this.selectedRequest instanceof AssetCreateRequestRecord
    },
  },

  created () {
    this.initFirstPageLoader()
  },

  methods: {
    initFirstPageLoader () {
      this.isLoaded = false
      this.requestsHistory = []
      this.firstPageLoader = this.getFirstPageLoader(this.accountId)
    },

    closeDetailsDrawer () {
      this.isDetailsDrawerShown = false
    },

    getFirstPageLoader (accountId) {
      return function () {
        return Sdk.horizon.request.getAllForAssets({
          requestor: accountId,
        })
      }
    },

    setHistory (data) {
      this.requestsHistory =
        data.map(request => RecordWrapper.request(request))
      this.isLoaded = true
    },

    extendHistory (data) {
      this.requestsHistory = this.requestsHistory.concat(
        data.map(request => RecordWrapper.request(request))
      )
    },

    showRequestDetails (index) {
      this.selectedIndex = index
      this.isUpdateMode = false
      this.isDetailsDrawerShown = true
    },

    async cancelRequest () {
      this.isRequestCancelling = true
      try {
        const operation = base.ManageAssetBuilder.cancelAssetRequest({
          requestID: this.selectedRequest.id,
        })
        await Sdk.horizon.transactions.submitOperations(operation)
        const { data } = await Sdk.horizon.request.get(this.selectedRequest.id)
        this.requestsHistory.splice(this.selectedIndex, 1,
          RecordWrapper.request(data)
        )
        Bus.success('asset-creation-requests.request-canceled-msg')
      } catch (e) {
        ErrorHandler.process(e)
      }
      this.isRequestCancelling = false
    },
  },
}
</script>

<style lang="scss" scoped>
@import "~@scss/variables";
@import "~@scss/mixins";

.asset-creation-requests__table {
  tr td:last-child {
    width: 3rem;
    text-align: right;
  }
}

.request-details-btn {
  font-size: 1.2rem;
  color: $col-primary-lighten;
  cursor: pointer;
}

.request-state {
  padding-left: 3rem;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    width: 0.6rem;
    height: 0.6rem;
    top: 1.7rem;
    transform: translateY(-50%);
    left: 1.6rem;
    border-radius: 100%;
  }

  &--approved:before {
    background-color: $col-success;
  }

  &--pending:before {
    background-color: $col-warning;
  }

  &--rejected:before,
  &--canceled:before,
  &--permanently-rejected:before {
    background-color: $col-error;
  }
}

.asset-creation-requests__loader {
  margin-top: .8rem;
}
</style>
