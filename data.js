const buildingData = {
    floors: [
        { id: "f1", name: "Floor 1" },
        { id: "f2", name: "Floor 2" }
    ],
    nodes: [
        // Floor 1
        { id: "entrance", floor: "f1", x: 500, y: 800, label: "Main Entrance", type: "room" },
        { id: "f1_lobby", floor: "f1", x: 500, y: 600, label: "Lobby", type: "hallway" },
        { id: "f1_elev", floor: "f1", x: 700, y: 600, label: "Elevator (F1)", type: "elevator" },
        { id: "room_101", floor: "f1", x: 300, y: 600, label: "Room 101", type: "room" },
        { id: "room_102", floor: "f1", x: 300, y: 400, label: "Room 102", type: "room" },
        { id: "f1_hall_n", floor: "f1", x: 500, y: 400, label: "North Hall F1", type: "hallway" },
        { id: "room_103", floor: "f1", x: 700, y: 400, label: "Room 103", type: "room" },
        // Floor 2
        { id: "f2_elev", floor: "f2", x: 700, y: 600, label: "Elevator (F2)", type: "elevator" },
        { id: "f2_lobby", floor: "f2", x: 500, y: 600, label: "F2 Reception", type: "hallway" },
        { id: "room_201", floor: "f2", x: 300, y: 600, label: "Room 201", type: "room" },
        { id: "room_202", floor: "f2", x: 300, y: 400, label: "Room 202", type: "room" },
        { id: "f2_hall_n", floor: "f2", x: 500, y: 400, label: "North Hall F2", type: "hallway" },
        { id: "room_203", floor: "f2", x: 700, y: 400, label: "Room 203", type: "room" }
    ],
    edges: [
        // F1 connections
        { from: "entrance", to: "f1_lobby", weight: 20 },
        { from: "f1_lobby", to: "f1_elev", weight: 20 },
        { from: "f1_lobby", to: "room_101", weight: 20 },
        { from: "f1_lobby", to: "f1_hall_n", weight: 20 },
        { from: "room_101", to: "room_102", weight: 20 },
        { from: "f1_hall_n", to: "room_102", weight: 20 },
        { from: "f1_hall_n", to: "room_103", weight: 20 },
        { from: "f1_elev", to: "room_103", weight: 20 },
        // Elevator connection
        { from: "f1_elev", to: "f2_elev", weight: 50 }, // cross-floor penalty
        // F2 connections
        { from: "f2_elev", to: "f2_lobby", weight: 20 },
        { from: "f2_lobby", to: "room_201", weight: 20 },
        { from: "f2_lobby", to: "f2_hall_n", weight: 20 },
        { from: "room_201", to: "room_202", weight: 20 },
        { from: "f2_hall_n", to: "room_202", weight: 20 },
        { from: "f2_hall_n", to: "room_203", weight: 20 },
        { from: "f2_elev", to: "room_203", weight: 20 }
    ]
};
