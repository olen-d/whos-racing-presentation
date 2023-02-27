export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      currentJWT: '',
      currentRefreshToken: '',
      doLogout: false,
      now: new Date(),
      publicKey: '',
    }
  },

  getters: {
    jwtData (state) {
      return state.currentJWT ? JSON.parse(atob(state.currentJWT.split(".")[1])) : null
    },
    isAuthorized (state) {
      if (state.publicKey && verifyBearerToken(this.currentJWT, state.publicKey)) {
        return true
      } else {
        return false
      }
    },
    sub () {
      return this.jwtData ? this.jwtData.sub : null
    },
    role () {
      return this.jwtData ? this.jwtData.role : null
    }
  },

  actions: {
    async fetchJWT() {
      const res = localStorage.getItem('user_token')
      this.currentJWT = res
    },
    start() {
      this.now = new Date() + 1000 * 60
    }
  }
})
