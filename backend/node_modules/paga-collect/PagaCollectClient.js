const PagaCollect = require('./PagaCollect');



class PagaCollectClient {
    constructor() {}
    setClientId(clientId) {
        this.clientId = clientId;
        return this;
    }

    setPassword(password) {
        this.password = password;
        return this;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        return this;
    }

    setTest(test) {
        this.test = test;
        return this;
    }

    build() {

        return new PagaCollect(this);
    }

}

module.exports = PagaCollectClient;