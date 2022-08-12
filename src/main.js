const configFile = require("./config");
const { fetch } = require("undici");

const Logger = require("outline-logs");
const MLogger = new Logger();

const steamUser = require("steam-user");
const SteamUser = new steamUser();


const Handle = require("./handle");
const handle = new Handle();

//  inspired by https://github.com/ElijahPepe/multiversus.js

class API {
    constructor(accessToken, userAgent = configFile.userAgent, APIKey = configFile.apiKey, hUseragent = configFile.hUserAgent) {
        Object.defineProperty(this, "accessToken", { writable: true });
        this.accessToken = accessToken;
        this.userAgent = userAgent;
        this.APIKey = APIKey;
        this.hUseragent = hUseragent;
        this.method = "GET";
        this.body = null;
        this.ticket = null;
    }

    Headers() {
        var Headers = {
            "user-agent": this.userAgent,
            "x-hydra-api-key": this.APIKey,
            "x-hydra-access-token": this.accessToken,
            "x-hydra-user-agent": this.hUseragent,
            "Content-Type": "application/json"
        };
        return (Headers);
    }

    async fetch({ url, method = this.method, body = this.body, accessToken = true } = {}) {
        if (!accessToken) {
            this.Headers = {
                "user-agent": this.userAgent,
                "x-hydra-api-key": this.APIKey,
                "x-hydra-user-agent": this.hUseragent,
                "Content-Type": "application/json"
            }
        }

        return fetch(url, {
            headers: this.Headers,
            method,
            body
        }).then(async res => {
            return res.json();
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
                SteamUser.getEncryptedAppTicket(1818750, async (err, aTicket) => {
                    if (err) {
                        MLogger.Log.ERROR(err);
                    }

                    const data = await this.info(aTicket.toString("hex").toUpperCase());
                    this.accessToken = data.token;
                    
                    MLogger.Log.INFO("Logged in Successfully.");
                    resolve(this);
                });
            });
        });
    }

	info(steamTicket) {
		return new Promise(async (resolve, reject) => {
			if (!steamTicket && !this.steamTicket) {
				MLogger.Log.ERROR("Please enter a steamTicket!")
			}
			const data = await this.fetch({
				url: "https://dokken-api.wbagora.com/access",
				method: "POST",
				body: JSON.stringify({
					auth: { fail_on_missing: true, steam: this.ticket ? this.ticket : steamTicket },
					options: [
						"configuration",
						"achievements",
						"account",
						"profile",
						"notifications",
						"maintenance",
						"wb_network",
					],
				}),
				accessToken: false,
			});
			handle.handle(data, resolve, reject);
		});
	}
}

module.exports = API;