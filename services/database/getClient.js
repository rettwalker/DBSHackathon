const pg = require('pg');

const GetClient = () => ({
    client: null,
    getConnection() {
        if (!this.client) {
            this.client = this.createConnection();
        }
        return Promise.resolve(this.client);
    },
    createConnection() {
        const client = new pg.Client({ connectionString: process.env["DATABASE_URL"] });

        client.on('error', (err) => {
            this.client.end().then(() => {
                this.client = null;
                return;
            });
        });
        return client.connect().then(() => {
            return client;
        });
    }
    // function getClient() {
    //     if (!client) {
    //         client =
    //     }
    //     return client;
    // }
});


module.exports = GetClient();