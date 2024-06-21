
export default class ServerRequests {
  static #instance: ServerRequests
  host: string


  static getInstance() {
    if (!this.#instance) {
      this.#instance = new ServerRequests();
    }
    return this.#instance;
  }

  constructor() {
    const protocole = process.env.NODE_ENV == 'production' ? 'https://' : 'http://'
    const serverUrl = protocole + process.env.SERVER_URL+ "/api" || "http://localhost/api";
    this.host = serverUrl;
  }

  post = async (path: string, payload: Object) => {
    try {
      const response = await fetch(this.host + path,{
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": 'Bearer: '+ process.env.SERVER_TOKEN,
        },
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(payload), // body data type must match "Content-Type" header
      });
      const res = await response.json();
      return res;
    } catch(error) {
      console.error("Error:", error);
    }
  }

  get = async (path: string) => {
    try {
      const response = await fetch(this.host + path,
        {
          method: "GET", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": 'Bearer: '+ process.env.SERVER_TOKEN,
          },
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        }
      );
      const res = await response.json();
      return res;
    } catch(error) {
      console.error("Error:", error);
    }
  }
}