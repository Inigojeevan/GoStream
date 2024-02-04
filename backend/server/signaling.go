package server

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var AllroomMap RoomMap

func CreateRoomRequestHandler (w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")	//CORS
	roomID := AllroomMap.CreateRoom()

	type response struct {
		RoomID string `json:"roomID"`
	}
	json.NewEncoder(w).Encode(response{RoomID: roomID})
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type broadcastMessage struct {
	Message map[string]interface{}
	RoomID string
	Client *websocket.Conn
}	

var broadCast = make(chan broadcastMessage)

func broadCaster() {
	for{	
		msg := <-broadCast
		for _, client := range AllroomMap.Map[msg.RoomID]{
			if client.Conn != msg.Client{
				err := client.Conn.WriteJSON(msg.Message)
				if err != nil{
					log.Fatal((err))
					client.Conn.Close()
				}
			}		
		}

	}
}

func JoinRoomRequestHandler(w http.ResponseWriter, r *http.Request){
	roomID, ok := r.URL.Query()["roomID"]
	if !ok {
		log.Fatal("RoomID not found")
	}
	ws, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Fatal(err)
	}

	AllroomMap.InsertIntoRoom(false, ws, roomID[0])
	
	go broadCaster()

	for {
		var msg broadcastMessage
		err := ws.ReadJSON(&msg.Message)
		if err != nil {
			log.Fatal("Read Error:", err)
		}

		msg.Client = ws
		msg.RoomID = roomID[0]

		log.Println(msg.Message)

		broadCast <- msg
	}

}