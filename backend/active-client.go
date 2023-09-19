package main

import (
	"time"

	"github.com/gorilla/websocket"
)

type ActiveClient struct { // an active client is a client with extra game specific data
	Client
	Conn  *websocket.Conn `json:"-"`
	Times [][]time.Time   `json:"cards"`
}

func (activeClient *ActiveClient) SendRoomState(room *Room) {
	/*
		sends the room state to an active client
	*/
	activeClient.Conn.WriteJSON(RoomSender{
		Type:    "room-state",
		Payload: *room,
	})
}
