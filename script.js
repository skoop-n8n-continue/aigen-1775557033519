document.addEventListener('DOMContentLoaded', () => {
    const startSelect = document.getElementById('start-location');
    const endSelect = document.getElementById('end-location');
    const findRouteBtn = document.getElementById('find-route-btn');
    const resetBtn = document.getElementById('reset-btn');
    const floorBtns = document.querySelectorAll('.floor-btn');
    const directionsPanel = document.getElementById('directions-panel');
    const directionsList = document.getElementById('directions-list');
    
    let currentFloor = 'f1';
    let graph = {};
    let currentRoute = [];

    // Initialize Application
    function init() {
        buildGraph();
        populateDropdowns();
        renderMap(currentFloor);
        setupEventListeners();
    }

    // Build Adjacency List for Dijkstra
    function buildGraph() {
        buildingData.nodes.forEach(node => {
            graph[node.id] = {};
        });
        
        buildingData.edges.forEach(edge => {
            // Bidirectional graph
            graph[edge.from][edge.to] = edge.weight;
            graph[edge.to][edge.from] = edge.weight;
        });
    }

    // Populate Dropdowns with locations that have labels
    function populateDropdowns() {
        const locations = buildingData.nodes
            .filter(n => n.label && n.type !== 'hallway')
            .sort((a, b) => a.label.localeCompare(b.label));
            
        locations.forEach(loc => {
            const floorName = buildingData.floors.find(f => f.id === loc.floor).name;
            const optionStart = new Option(`${loc.label} (${floorName})`, loc.id);
            const optionEnd = new Option(`${loc.label} (${floorName})`, loc.id);
            startSelect.add(optionStart);
            endSelect.add(optionEnd);
        });
        
        // Auto-select entrance as default start
        startSelect.value = 'entrance';
    }

    function setupEventListeners() {
        floorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetFloor = e.target.getAttribute('data-floor');
                switchFloor(targetFloor);
            });
        });

        findRouteBtn.addEventListener('click', calculateAndShowRoute);
        
        resetBtn.addEventListener('click', () => {
            startSelect.value = 'entrance';
            endSelect.value = '';
            currentRoute = [];
            directionsPanel.classList.add('hidden');
            switchFloor('f1');
            renderMap('f1');
        });
    }

    function switchFloor(floorId) {
        currentFloor = floorId;
        floorBtns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.floor-btn[data-floor="${floorId}"]`).classList.add('active');
        renderMap(floorId);
    }

    // Dijkstra's Algorithm
    function findShortestPath(start, end) {
        const distances = {};
        const previous = {};
        const unvisited = new Set(Object.keys(graph));

        Object.keys(graph).forEach(node => {
            distances[node] = Infinity;
        });
        distances[start] = 0;

        while (unvisited.size > 0) {
            let currNode = null;
            let minDistance = Infinity;

            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    currNode = node;
                }
            }

            if (currNode === null || currNode === end) break;
            unvisited.delete(currNode);

            for (const neighbor in graph[currNode]) {
                const alt = distances[currNode] + graph[currNode][neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = currNode;
                }
            }
        }

        const path = [];
        let curr = end;
        while (curr) {
            path.unshift(curr);
            curr = previous[curr];
        }

        return path[0] === start ? path : [];
    }

    function calculateAndShowRoute() {
        const start = startSelect.value;
        const end = endSelect.value;
        
        if (!start || !end) {
            alert('Please select both a starting location and destination.');
            return;
        }

        if (start === end) {
            alert('You are already at your destination.');
            return;
        }

        currentRoute = findShortestPath(start, end);
        
        if (currentRoute.length > 0) {
            const startNode = buildingData.nodes.find(n => n.id === start);
            switchFloor(startNode.floor);
            generateDirections();
            renderMap(currentFloor);
        } else {
            alert('No route found between these locations.');
        }
    }

    function generateDirections() {
        directionsList.innerHTML = '';
        let stepCount = 1;
        let currentFloorObj = buildingData.nodes.find(n => n.id === currentRoute[0]).floor;

        const startNode = buildingData.nodes.find(n => n.id === currentRoute[0]);
        const endNode = buildingData.nodes.find(n => n.id === currentRoute[currentRoute.length - 1]);
        
        addDirectionStep(`Start at ${startNode.label}`, true);

        for (let i = 1; i < currentRoute.length; i++) {
            const prev = buildingData.nodes.find(n => n.id === currentRoute[i - 1]);
            const curr = buildingData.nodes.find(n => n.id === currentRoute[i]);

            if (prev.floor !== curr.floor) {
                const floorName = buildingData.floors.find(f => f.id === curr.floor).name;
                addDirectionStep(`Take the elevator/stairs to ${floorName}`);
            } else if (curr.id === endNode.id) {
                addDirectionStep(`Arrive at ${curr.label}`);
            } else if (curr.type !== 'hallway' && curr.type !== 'elevator') {
                addDirectionStep(`Pass by ${curr.label}`);
            }
        }
        
        directionsPanel.classList.remove('hidden');
    }

    function addDirectionStep(text, highlight = false) {
        const li = document.createElement('li');
        li.textContent = text;
        if (highlight) li.classList.add('highlight');
        directionsList.appendChild(li);
    }

    // Render SVG Map
    function renderMap(floorId) {
        const corridorsGroup = document.getElementById('corridors');
        const nodesGroup = document.getElementById('nodes-layer');
        const routeGroup = document.getElementById('route-layer');

        corridorsGroup.innerHTML = '';
        nodesGroup.innerHTML = '';
        routeGroup.innerHTML = '';

        const nodesOnFloor = buildingData.nodes.filter(n => n.floor === floorId);

        // Add Floor Label (SVG background text)
        const floorObj = buildingData.floors.find(f => f.id === floorId);
        const floorLabelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        floorLabelBg.setAttribute("x", 40);
        floorLabelBg.setAttribute("y", 40);
        floorLabelBg.setAttribute("width", 140);
        floorLabelBg.setAttribute("height", 50);
        floorLabelBg.setAttribute("class", "floor-label-bg");
        corridorsGroup.appendChild(floorLabelBg);

        const floorLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        floorLabel.setAttribute("x", 110);
        floorLabel.setAttribute("y", 73);
        floorLabel.setAttribute("class", "floor-label-text");
        floorLabel.textContent = floorObj.name.toUpperCase();
        corridorsGroup.appendChild(floorLabel);

        // Draw Corridors (Base paths based on edges on this floor)
        const drawnEdges = new Set();
        buildingData.edges.forEach(edge => {
            const n1 = buildingData.nodes.find(n => n.id === edge.from);
            const n2 = buildingData.nodes.find(n => n.id === edge.to);

            if (n1.floor === floorId && n2.floor === floorId) {
                const edgeId = [edge.from, edge.to].sort().join('-');
                if (!drawnEdges.has(edgeId)) {
                    drawnEdges.add(edgeId);

                    const lineOut = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    lineOut.setAttribute("x1", n1.x);
                    lineOut.setAttribute("y1", n1.y);
                    lineOut.setAttribute("x2", n2.x);
                    lineOut.setAttribute("y2", n2.y);
                    lineOut.setAttribute("class", "corridor-outline");
                    corridorsGroup.appendChild(lineOut);

                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", n1.x);
                    line.setAttribute("y1", n1.y);
                    line.setAttribute("x2", n2.x);
                    line.setAttribute("y2", n2.y);
                    line.setAttribute("class", "corridor");
                    corridorsGroup.appendChild(line);
                }
            }
        });

        // Draw Route Path if exists and on this floor
        if (currentRoute.length > 0) {
            let pathData = '';
            let isDrawing = false;

            for (let i = 0; i < currentRoute.length; i++) {
                const nId = currentRoute[i];
                const node = buildingData.nodes.find(n => n.id === nId);

                if (node.floor === floorId) {
                    if (!isDrawing) {
                        pathData += `M ${node.x} ${node.y} `;
                        isDrawing = true;
                    } else {
                        pathData += `L ${node.x} ${node.y} `;
                    }
                } else {
                    isDrawing = false;
                }
            }

            if (pathData) {
                const outerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                outerPath.setAttribute("d", pathData);
                outerPath.setAttribute("class", "route-path-outer");
                routeGroup.appendChild(outerPath);

                const routePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                routePath.setAttribute("d", pathData);
                routePath.setAttribute("class", "route-path");
                routeGroup.appendChild(routePath);
            }
        }

        // Draw Nodes
        nodesOnFloor.forEach(node => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", node.x);
            circle.setAttribute("cy", node.y);
            circle.setAttribute("r", node.type === 'hallway' ? 10 : 22);

            let nodeClass = "node";
            if (node.type !== 'hallway') nodeClass += ` ${node.type}`;
            if (currentRoute.length > 0) {
                if (currentRoute[0] === node.id) nodeClass += " start-pin";
                if (currentRoute[currentRoute.length - 1] === node.id) nodeClass += " end-pin";
            }
            circle.setAttribute("class", nodeClass);

            // Allow clicking nodes to set destination
            if (node.type !== 'hallway') {
                circle.addEventListener('click', () => {
                    endSelect.value = node.id;
                    calculateAndShowRoute();
                });
            }

            nodesGroup.appendChild(circle);

            // Add Label
            if (node.label && node.type !== 'hallway') {
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", node.x);
                text.setAttribute("y", node.y - 35);
                text.setAttribute("class", "node-label");
                text.textContent = node.label;
                nodesGroup.appendChild(text);
            }
        });
    }

    init();
});
