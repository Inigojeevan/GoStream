package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Inigojeevan/WebRTC/server"
)

func main() {
	server.AllroomMap.Init()

	http.HandleFunc("/createRoom", server.CreateRoomRequestHandler)
	http.HandleFunc("/joinRoom", server.JoinRoomRequestHandler)

	log.Println("Server started at port 8080")
	fmt.Println("")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}