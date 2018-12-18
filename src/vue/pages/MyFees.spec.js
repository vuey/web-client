import MyFees from './MyFees'

import Vuex from 'vuex'
import Vue from 'vue'

import { vuexTypes } from '@/vuex'
import walletModule from '@/vuex/wallet.module'

import { createLocalVue, shallowMount } from '@vue/test-utils'

import { globalize } from '@/vue/filters/globalize'
import { localizeFeeType } from '@/vue/filters/localizeFeeType'
import { localizeFeeSubType } from '@/vue/filters/localizeFeeSubType'

import { MockHelper } from '@/test'

// HACK: https://github.com/vuejs/vue-test-utils/issues/532, waiting for
// Vue 2.6 so everything get fixed
Vue.config.silent = true

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.filter('globalize', globalize)
localVue.filter('localizeFeeType', localizeFeeType)
localVue.filter('localizeFeeSubType', localizeFeeSubType)

describe('MyFees component unit test', () => {
  let mockHelper
  let wrapper
  let feesResource

  beforeEach(async () => {
    sinon.restore()
    mockHelper = new MockHelper()
    const getters = walletModule.getters

    sinon.stub(getters, vuexTypes.wallet).returns(
      mockHelper.getMockWallet()
    )

    const store = new Vuex.Store({
      modules: {
        'new-wallet': {
          namespaced: true,
          getters
        }
      }
    })

    feesResource = mockHelper.getHorizonResourcePrototype('fees')
    sinon.stub(feesResource, 'getAll').returns(
      // eslint-disable-next-line
      new Promise((resolve) => {
        resolve({
          _data: {
            fees: {
              ali: new Array(1),
              btc: new Array(2)
            }
          }
        })
      }))

    wrapper = shallowMount(MyFees, {
      store,
      localVue
    })
    await wrapper.vm.fetchFees()
  })

  it('Fees loaded by current account ID', () => {
    expect(
      feesResource.getAll
        .withArgs({ account_id: mockHelper.getMockWallet().accountId })
        .calledTwice)
      .to
      .be
      .true
  })

  it('fetchFees() changes fees data after fetching', async () => {
    wrapper.setData({
      fees: null
    })
    await wrapper.vm.fetchFees()
    expect(wrapper.vm.fees).to.not.equal(null)
  })

  it('assetFees returns only the fees with the name currentAssetName', async () => {
    wrapper.setData({
      currentAssetName: 'ALI'
    })
    expect(wrapper.vm.assetFees.length).to.equal(1)
  })

  it('assetFees property changes after changing currentAssetName', async () => {
    wrapper.setData({
      currentAssetName: 'BTC'
    })
    expect(wrapper.vm.assetFees.length).to.equal(2)
  })

  it('assetNames returns array of assets', async () => {
    expect(wrapper.vm.assetNames).to.deep.equal(['ALI', 'BTC'])
  })
})
