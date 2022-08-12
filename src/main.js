const configFile = require("./config");
const { fetch } = require("undici");

const Logger = require("outline-logs");
const MLogger = new Logger();

const steamUser = require("steam-user");
const SteamUser = new steamUser();

//  inspired by https://github.com/ElijahPepe/multiversus.js

class API {
    constructor(accessToken, userAgent = configFile.userAgent, APIKey = configFile.apiKey, hUseragent = configFile.hUserAgent) {
        this.accessToken = accessToken;
        this.userAgent = userAgent;
        this.APIKey = APIKey;
        this.hUseragent = hUseragent;
        this.method = "GET";
        this.body = null;
        var url;
        this.url = url;
    }

    async fetch({ body = this.body } = {}) {
        return fetch(this.url, {
            headers: {
                "user-agent": this.userAgent,
                "x-hydra-api-key": this.APIKey,
                "x-hydra-access-token": this.accessToken,
                "x-hydra-user-agent": this.hUseragent,
                "Content-Type": "application/json"
            }
        });
    }

    async login(displayName, password) {
        new Promise(resolve => {
            const handling = 
            !displayName || 
            !password || 
            typeof displayName !== "string"
            typeof password !== "string";

            if (handling) {
                MLogger.Log.ERROR("Invalid Username or Password!"); 
            }

            SteamUser.logOn({
                accountName: displayName,
                password: password
            });

            SteamUser.on("loggedOn", () => {
                SteamUser.getEncryptedAppTicket(1818750,  async (err, aTicket) => {
                    if (err) {
                        MLogger.Log.ERROR(err);
                    }
                });
            });
        });
    }
}

module.exports = API;