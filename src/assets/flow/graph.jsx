import ReactFlow, { addEdge, Controls, Background, useNodesState, useEdgesState, updateEdge } from 'reactflow';
import { Button } from "antd";
import 'reactflow/dist/style.css';
import { useState, useCallback, useRef } from 'react';

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // ['A', 'B', 'C', ..., 'Z']

const initialNodes = [];
const initialEdges = [];

function Flow() {
  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [alphabetIndex, setAlphabetIndex] = useState(0);

  const onConnect = useCallback((params) => {
    const weight = prompt('Enter weight for the edge', '1');
    const edge = { ...params, label: weight };
    setEdges((eds) => addEdge(edge, eds));
  }, [setEdges]);

  const createNode = () => {
    if (alphabetIndex < alphabet.length) {
      const newLabel = alphabet[alphabetIndex];
      const newNode = {
        id: (nodes.length + 1).toString(),
        data: { label: newLabel, position: 'right' },
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        sourcePosition: "right",
        targetPosition: "left",
        style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
      };
      setNodes((nds) => nds.concat(newNode));
      setAlphabetIndex(alphabetIndex + 1);
    } else {
      console.log('No more alphabet letters available');
    }
  };

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, [setEdges]);

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeUpdateSuccessful.current = true;
  }, [setEdges]);

  const onEdgeDoubleClick = useCallback((event, edge) => {
    const newLabel = prompt('Enter new weight for the edge', edge.label);
    if (newLabel) {
      setEdges((eds) => eds.map((e) => e.id === edge.id ? { ...e, label: newLabel } : e));
    }
  }, [setEdges]);

  const findShortestPath = (startNode, endNode) => {
    const distances = {};
    const prev = {};
    const pq = [];
    const visited = new Set();

    nodes.forEach((node) => {
      distances[node.id] = Infinity;
      prev[node.id] = null;
    });

    distances[startNode] = 0;
    pq.push({ id: startNode, distance: 0 });

    while (pq.length > 0) {
      pq.sort((a, b) => a.distance - b.distance);
      const { id: currentNode } = pq.shift();
      if (currentNode === endNode) break;

      if (!visited.has(currentNode)) {
        visited.add(currentNode);
        const neighbors = edges.filter((edge) => edge.source === currentNode);

        neighbors.forEach((neighbor) => {
          const weight = parseFloat(neighbor.label);
          const alt = distances[currentNode] + weight;
          if (alt < distances[neighbor.target]) {
            distances[neighbor.target] = alt;
            prev[neighbor.target] = currentNode;
            pq.push({ id: neighbor.target, distance: alt });
          }
        });
      }
    }

    const path = [];
    let u = endNode;
    while (prev[u]) {
      path.unshift(u);
      u = prev[u];
    }
    if (distances[endNode] !== Infinity) {
      path.unshift(startNode);
    }

    return path;
  };

  const handleShortestPath = () => {
    const startNode = nodes[0]?.id;
    const endNode = nodes[nodes.length - 1]?.id;

    if (!startNode || !endNode) {
      alert('Please create at least two nodes.');
      return;
    }

    const shortestPath = findShortestPath(startNode, endNode);
    if (shortestPath.length === 0) {
      alert('No path found.');
      return;
    }

    const updatedNodes = nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        backgroundColor: shortestPath.includes(node.id) ? 'lightgreen' : 'white'
      }
    }));

    const updatedEdges = edges.map((edge) => ({
      ...edge,
      style: {
        stroke: shortestPath.includes(edge.source) && shortestPath.includes(edge.target) ? 'green' : 'black'
      }
    }));

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  

    
  
    

  return (
    <div style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeDoubleClick={onEdgeDoubleClick}
        snapToGrid
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onConnect={onConnect}
        fitView
      >
        <Background variant='lines' />
        <Controls>
          <button
            onClick={createNode}
            style={{ background: 'skyblue', border: 'none', width: '100%', height: '30px' }}
          >
            C
          </button>
          <div>
            <button
              onClick={createNode}
              style={{ background: 'red', border: 'none', width: '100%', height: '30px' }}
            >
              D
            </button>
          </div>
        </Controls>
      </ReactFlow>
      <div style={{ margin: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Button type='primary' onClick={handleShortestPath}>Traiter minimal</Button>
        <Button style={{ marginLeft: "20px" }} type="dashed">Traiter maximal</Button>
        <Button style={{ marginLeft: "20px" }} danger>Voir les traitements</Button>
      </div>
    </div>
  );
}

export default Flow;
