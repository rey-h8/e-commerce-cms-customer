import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../../config/axios'
import router from '../router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: { details: {}, isLoggedIn: false, cart: {} },
    products: [],
    banners: [],
    productCategories: [],
    isSigningIn: false,
    isFetchingUserDetails: false,
    isFetchingBanners: false,
    isFetchingProductCategories: false,
    isFetchingProducts: false,
    isFetchingCart: false,
    isAddingCartItem: '',
  },
  getters: {
    isLoggedIn: state => {
      return state.user.isLoggedIn
    },
    cart: state => {
      return state.user.cart
    },
    userDetails: state => {
      return state.user.details
    },
  },
  mutations: {
    CLEAR_USER(state) {
      state.user = { details: {}, isLoggedIn: false, cart: {} }
    },
    SET_USER(state, payload) {
      state.user = payload
    },
    SET_USER_DETAILS(state, payload) {
      state.user.details = payload
    },
    SET_IS_LOGGED_IN(state, payload) {
      state.user.isLoggedIn = payload
    },
    SET_CART(state, payload) {
      state.user.cart = payload
    },
    SET_PRODUCTS(state, payload) {
      state.products = payload
    },
    SET_PRODUCT_CATEGORIES(state, payload) {
      state.productCategories = payload
    },
    SET_BANNERS(state, payload) {
      state.banners = payload
    },
    SET_IS_SIGNING_IN(state, payload) {
      state.isSigningIn = payload
    },
    SET_IS_FETCHING_PRODUCTS(state, payload) {
      state.isFetchingProducts = payload
    },
    SET_IS_FETCHING_PRODUCT_CATEGORIES(state, payload) {
      state.isFetchingProductCategories = payload
    },
    SET_IS_FETCHING_BANNERS(state, payload) {
      state.isFetchingBanners = payload
    },
    SET_IS_FETCHING_CART(state, payload) {
      state.isFetchingCart = payload
    },
    SET_IS_ADDING_CART_ITEM(state, payload) {
      state.isAddingCartItem = payload
    },
    SET_IS_FETCHING_USER_DETAILS(state, payload) {
      state.isFetchingUserDetails = payload
    },
  },

  actions: {
    checkout({ commit, dispatch, state }, payload) {
      // kurangi stock

      let orders = state.user.cart.CartProducts.map(cartitem => {
        return {
          ProductId: cartitem.ProductId,
          quantity: cartitem.quantity,
          price: cartitem.Product.price,
        }
      })

      console.log(orders, '<<<<< orders')

      // set status cart jadi paid
      axios({
        method: 'PATCH',
        url: '/carts',
        data: {
          status: 'paid',
          CartId: payload.CartId,
        },
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<< update status cart')
          commit('SET_CART', '')
          dispatch('fetchCart')
          router.push('/')
        })
        .catch(err => {
          console.log(err.response.data, '<<<<< error updating cart status')
        })
    },

    fetchCartItems({ commit, state }) {
      console.log('fetch cart items')
      console.log('cartId:', state.user.cart.id)
      axios({
        method: 'GET',
        url: '/cartitems',
        data: { CartId: state.user.cart.id, test: 'test' },
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<<<< current cart items')
          commit('SET_CART_ITEMS', data)
          commit('SET_ADDING_CART_ITEM', null)
        })
        .catch(err => {
          console.log(err.response.data, '<<<<< error fetching cartitems')
        })
    },
    fetchCart({ commit }) {
      commit('SET_IS_FETCHING_CART', true)
      console.log('fetch cart')
      axios({
        method: 'GET',
        url: '/carts/current',
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<<<< current cart')
          commit('SET_CART', data)
          commit('SET_IS_FETCHING_CART', false)
        })
        .catch(err => {
          console.log(err.response.data, '<<<<< error fetching cart')
          commit('SET_IS_FETCHING_CART', false)
        })
    },
    updateQuantity({ dispatch }, payload) {
      console.log('update quantity', payload)
      axios({
        method: 'PATCH',
        url: '/cartitems',
        data: payload,
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<< result update quantity')
          dispatch('fetchCart')
          // dispatch('fetchCartItems')
        })
        .catch(err => {
          console.log(err.response.data, '>>>> error update quantity')
          dispatch('fetchCart')
          // dispatch('fetchCartItems')
        })
    },
    addProductToCart({ dispatch, commit }, payload) {
      commit('SET_IS_ADDING_CART_ITEM', payload.ProductId)
      console.log('add product to cart')
      axios({
        method: 'POST',
        url: '/cartitems',
        data: payload,
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<< result add product to cart')
          Vue.$vToastify.success(`${data.name} added to cart`)
          dispatch('fetchCart')
        })
        .catch(err => {
          Vue.$vToastify.error(
            `Failed adding the product to cart. ${err.response.data}`
          )

          console.log(err.response.data, '>>>> error add product to cart')
          dispatch('fetchCart')
        })
        .finally(() => {
          commit('SET_IS_ADDING_CART_ITEM', null)
        })
    },
    signOut({ commit }) {
      // eslint-disable-next-line no-undef
      if (gapi.auth2) {
        // eslint-disable-next-line no-undef
        const auth2 = gapi.auth2.getAuthInstance()
        auth2.signOut().then(() => {
          console.log('User signed out.')
          localStorage.clear()
          commit('CLEAR_USER')
          router.push('/')
        })
      } else {
        console.log('User signed out.')
        localStorage.clear()
        commit('CLEAR_USER')
        router.push('/')
      }
    },
    onSignIn({ commit }, googleUser) {
      console.log('on google sign in')

      const id_token = googleUser.getAuthResponse().id_token
      console.log('id_token', id_token)
      axios({
        method: 'POST',
        url: '/googleLogin',
        data: { token: id_token },
      })
        .then(({ data }) => {
          console.log(data, '>>> google sign in response')
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token)
          }

          commit('SET_USER_DETAILS', data)
          commit('SET_IS_LOGGED_IN', true)

          router.push('/')
        })
        .catch(err => {
          console.log(err.response.data, '>>>> google sign in error')
          Vue.$vToastify.error(err.response.data)
          commit('SET_IS_LOGGED_IN', false)
        })
    },
    submitLoginForm(_, payload) {
      console.log({ payload })

      return axios({
        method: 'POST',
        url: '/login',
        data: payload,
      })
    },

    submitRegistration(_, payload) {
      console.log('submit register form')

      console.log({ payload })

      return axios({
        method: 'POST',
        url: '/register',
        data: payload,
      })
    },

    fetchUserDetails({ commit }) {
      commit('SET_IS_FETCHING_USER_DETAILS', true)
      console.log('fetching user details')

      axios({
        method: 'GET',
        url: '/user',
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<< user details')
          commit('SET_USER_DETAILS', data)
          commit('SET_IS_LOGGED_IN', true)
          commit('SET_IS_FETCHING_USER_DETAILS', false)
        })
        .catch(err => {
          console.log(err, '<<< error fetching user')
          commit('SET_IS_FETCHING_USER_DETAILS', false)

          if (err.response.data.status === 401) {
            localStorage.removeItem('access_token')
            router.push('/')
          }
        })
    },
    fetchBanners({ commit }) {
      console.log('fetching banners')
      commit('SET_IS_FETCHING_BANNERS', true)
      axios({
        method: 'GET',
        url: '/banners',
      })
        .then(({ data }) => {
          console.log(data, '<<< banners')
          commit('SET_IS_FETCHING_BANNERS', false)

          commit('SET_BANNERS', data)
        })
        .catch(err => {
          console.log(err.response.data, '<<< error fetching user')
          commit('SET_IS_FETCHING_BANNERS', false)
        })
    },
    fetchProductCategories({ commit }, payload) {
      console.log('fetching product categories')
      commit('SET_IS_FETCHING_PRODUCT_CATEGORIES', true)

      axios({
        method: 'GET',
        url: '/categories',
      })
        .then(({ data }) => {
          console.log(data, '<<< product categories')
          commit('SET_IS_FETCHING_PRODUCT_CATEGORIES', false)

          // Remove Unassigned category
          // data = data.filter(category => category.name !== 'Unassigned')
          commit('SET_PRODUCT_CATEGORIES', data)
        })
        .catch(err => {
          console.log(
            err.response.data,
            '<<< error fetching product categories'
          )
          commit('SET_IS_FETCHING_PRODUCT_CATEGORIES', false)
        })
    },
    fetchProducts({ commit }, payload = 0) {
      console.log('fetching products', payload)
      commit('SET_IS_FETCHING_PRODUCTS', true)

      axios({
        method: 'GET',
        url:
          payload && payload.category > -1
            ? `/products?category=${payload.category}`
            : '/products',
      })
        .then(({ data }) => {
          console.log(data, '<<< products')
          commit('SET_IS_FETCHING_PRODUCTS', false)

          commit('SET_PRODUCTS', data)
        })
        .catch(err => {
          console.log(err.response.data, '<<< error fetching products')
          commit('SET_IS_FETCHING_PRODUCTS', false)
        })
    },

    deleteCartItem({ dispatch }, payload) {
      console.log('delete cart item')

      axios({
        method: 'DELETE',
        url: '/cartitems',
        data: payload,
        headers: {
          access_token: localStorage.getItem('access_token'),
        },
      })
        .then(({ data }) => {
          console.log(data, '<<< products')
          dispatch('fetchCart')
        })
        .catch(err => {
          console.log(err.response.data, '<<< error delete cartitem')
          dispatch('fetchCart')
        })
    },
  },

  modules: {},
})
