class Session {
    constructor(sessionId, socketsCount){
        this.sessionId = sessionId
        this.socketsCount = socketsCount
        this.sockets = []
    }

    AddUser(socket){
        if(this.socketsCount >= this.sockets.length){
            this.sockets.push(socket)
        }
    }
}