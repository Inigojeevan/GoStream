package server

import (
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Participant struct {
	Host bool
	Conn *websocket.Conn
}

type RoomMap struct{
	Mutex sync.RWMutex
	Map map[string][]Participant
}

func (r *RoomMap) Init(){		//initializes the room map
	r.Map = make(map[string][]Participant)
}

func (r *RoomMap) Get(roomID string) []Participant{			//returns room id
	r.Mutex.RLock()
	defer r.Mutex.RLock()

	return r.Map[roomID]

}

func (r *RoomMap) CreateRoom() string{ 		//this function returns the roomID
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	rand.Seed(time.Now().UnixNano())

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	b := make([]rune, 8)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))] 	//generates a random room id
	}

	roomID := string(b)

	return roomID
}

func (r *RoomMap) InsertIntoRoom(host bool, conn *websocket.Conn, roomID string) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	p := Participant{host, conn}

	r.Map[roomID] = append(r.Map[roomID], p)

}

func (r *RoomMap) DeleteRoom(roomID string) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	delete(r.Map, roomID)  //Deletes the roomID from the map
}