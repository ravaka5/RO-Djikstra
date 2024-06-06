import ReactFlow, { addEdge, Controls, Background, useNodesState, useEdgesState, updateEdge } from 'reactflow';
import { Button, Table } from "antd";
import {StepBackwardOutlined , StepForwardOutlined} from "@ant-design/icons";
import 'reactflow/dist/style.css';
import { useState, useCallback, useRef } from 'react';

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // ['A', 'B', 'C', ..., 'Z']

const initialNodes = [
    {
      id:"1",
      data:{
        label:"A",
      },
      position:{
        x:-300,
        y:0
      },
      sourcePosition:"right",
      targetPosition: "left",
      style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
    },
    {
      id:"2",
      data:{
        label:"B",
      },
      position:{
        x:-200,
        y:-40
      },
      sourcePosition:"right",
      targetPosition: "left",
      style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
    },
    {
      id:"3",
      data:{
        label:"C",
      },
      position:{
        x:-80,
        y:-40
      },
      sourcePosition:"right",
      targetPosition: "left",
      style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
    },
    {
      id:"4",
      data:{
        label:"D",
      },
      position:{
        x:-200,
        y:40
      },
      sourcePosition:"right",
      targetPosition: "left",
      style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
    },
    {
      id:"5",
      data:{
        label:"E",
      },
      position:{
        x:-60,
        y:40
      },
      sourcePosition:"right",
      targetPosition: "left",
      style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
    },
    {
      id:"6",
      data:{
        label:"F",
      },
      position:{
        x:0,
        y:0
      },
      sourcePosition:"right",
      targetPosition: "left",
      style: { color: 'black', borderRadius: '200px', padding: '10px', width: "35px" },
    },
  
  ];

  const initialEdges = [
    {
      id:"1",
      source:"1",
      target:"2",
      label:"7",
      weight:7
  
    },
    {
      id:"2",
      source:"1",
      target:"4",
      label:"15",
      weight:15
  
    },
    {
      id:"3",
      source:"2",
      target:"3",
      label:"12",
      weight:12
  
    },
    {
      id:"4",
      source:"2",
      target:"6",
      label:"16",
      weight:16
  
    },
    {
      id:"5",
      source:"2",
      target:"5",
      label:"4",
      weight:4
  
    },
    {
      id:"6",
      source:"3",
      target:"6",
      label:"3",
      weight:3
  
    },
    {
      id:"7",
      source:"4",
      target:"3",
      label:"5",
      weight:5
  
    },
    {
      id:"8",
      source:"4",
      target:"5",
      label:"2",
      weight:2
  
    },
    {
      id:"9",
      source:"5",
      target:"6",
      label:"14",
      weight:14
  
    },
  ];

const highlightNodesAndEdges = async (currentNode, distances, pq, nodes, edges, setNodes, setEdges) => {
    const updatedNodes = nodes.map((node) => {
      const isCurrentNode = node.id === currentNode;
      const isInQueue = pq.some((item) => item.id === node.id);
      const isVisited = distances[node.id] !== Infinity && distances[node.id] !== -Infinity;
  
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: isCurrentNode
            ? 'yellow'
            : isInQueue
              ? 'lightblue'
              : isVisited
                ? 'lightgreen'
                : 'white',
        },
      };
    });
  
    const updatedEdges = edges.map((edge) => ({
      ...edge,
      style: {
        stroke: distances[edge.source] !== Infinity && distances[edge.target] !== Infinity ? 'green' : 'black',
      },
    }));
  
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    await new Promise(resolve => setTimeout(resolve, 500)); // Délai de 500ms pour visualiser les changements
  };
  
  const generateTableStep = (nodes, distances) => {
    return nodes.map(node => ({
      node: node.data.label,
      distance: distances[node.id] === Infinity ? '∞' : distances[node.id],
    }));
  };
  
  class BinaryHeap {
    constructor(compare) {
      this.heap = [];
      this.compare = compare;
    }
  
    push(item) {
      this.heap.push(item);
      this.heapifyUp(this.heap.length - 1);
    }
  
    pop() {
      if (this.heap.length === 0) return undefined;
      if (this.heap.length === 1) return this.heap.pop();
  
      const root = this.heap[0];
      this.heap[0] = this.heap.pop();
      this.heapifyDown(0);
      return root;
    }
  
    heapifyUp(index) {
      let current = index;
      while (current > 0) {
        const parent = Math.floor((current - 1) / 2);
        if (this.compare(this.heap[current], this.heap[parent]) < 0) {
          [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
          current = parent;
        } else {
          break;
        }
      }
    }
  
    heapifyDown(index) {
      let current = index;
      while (current < this.heap.length) {
        let next = current;
        const left = 2 * current + 1;
        const right = 2 * current + 2;
  
        if (left < this.heap.length && this.compare(this.heap[left], this.heap[next]) < 0) {
          next = left;
        }
  
        if (right < this.heap.length && this.compare(this.heap[right], this.heap[next]) < 0) {
          next = right;
        }
  
        if (next !== current) {
          [this.heap[current], this.heap[next]] = [this.heap[next], this.heap[current]];
          current = next;
        } else {
          break;
        }
      }
    }
  
    isEmpty() {
      return this.heap.length === 0;
    }
  
    toArray() {
      return this.heap.slice();
    }
  }
  
  
  const findShortestPath = async (nodes, edges, startNode, endNode, setNodes, setEdges, setProcessingSteps) => {
    const distances = {};
    const prev = {};
    const pq = new BinaryHeap((a, b) => a.distance - b.distance); // Utilisation d'un tas binaire pour la file de priorité
    const visited = new Set();
    const steps = [generateTableStep(nodes, distances)]; // Ajouter l'étape initiale
  
    nodes.forEach((node) => {
      distances[node.id] = Infinity;
      prev[node.id] = null;
    });
  
    distances[startNode] = 0;
    pq.push({ id: startNode, distance: 0 });
  
    while (!pq.isEmpty()) {
      const { id: currentNode } = pq.pop(); // Extraire le nœud avec la plus petite distance
      await highlightNodesAndEdges(currentNode, distances, pq.toArray(), nodes, edges, setNodes, setEdges);
  
      if (currentNode === endNode) break;
  
      if (!visited.has(currentNode)) {
        visited.add(currentNode);
        const neighbors = edges.filter((edge) => ((edge.source === currentNode) || (edge.target === currentNode)));
  
        neighbors.forEach((neighbor) => {
          const neighborNode = neighbor.source === currentNode ? neighbor.target : neighbor.source;
          const weight = parseFloat(neighbor.label);
          const alt = distances[currentNode] + weight;
          if (alt < distances[neighborNode]) {
            distances[neighborNode] = alt;
            prev[neighborNode] = currentNode;
            pq.push({ id: neighborNode, distance: alt });
          }
          console.log(prev);
        });
        steps.push(generateTableStep(nodes, distances)); // Ajouter une nouvelle étape
        console.log(generateTableStep(nodes,distances))
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
  
    const pathEdges = [];
    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i];
      const target = path[i + 1];
      const edge = edges.find((e) => (e.source === source && e.target === target) || (e.source === target && e.target === source));
      if (edge) {
        pathEdges.push(edge.id);
      }
    }
  
    setNodes((nodes) => {
      const updatedNodes = nodes.map((node) => ({
        ...node,
        style: { ...node.style, stroke: 'white' } // Réinitialiser le style des nœuds
      }));
      return updatedNodes;
    });
  
    setEdges((edges) => {
      const updatedEdges = edges.map((edge) => ({
        ...edge,
        style: {
          stroke: pathEdges.includes(edge.id) ? 'green' : 'black'
        }
      }));
      return updatedEdges;
    });
  
    setProcessingSteps(steps);
    return path;
  };
  
  function Flow() {
    const edgeUpdateSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [alphabetIndex, setAlphabetIndex] = useState(0);
    const [processingSteps, setProcessingSteps] = useState([[]]);
    const [currentStep, setCurrentStep] = useState(0);
  
    const onConnect = useCallback((params) => {
      const weight = prompt('Entrer le poids ici', '1');
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
        console.log('Plus de lettre disponible');
      }
    };

    const resetGraphStyles = () => {
        const resetNodes = nodes.map(node => ({
            ...node,
            style: {
                ...node.style,
                backgroundColor: 'white', // Couleur de fond par défaut
            },
        }));
    
        const resetEdges = edges.map(edge => ({
            ...edge,
            style: {
                stroke: 'black', // Couleur de bordure par défaut
            },
        }));
    
        setNodes(resetNodes);
        setEdges(resetEdges);
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
      const newLabel = prompt('Entrez le poids ici', edge.label);
      if (newLabel) {
        setEdges((eds) => eds.map((e) => e.id === edge.id ? { ...e, label: newLabel } : e));
      }
    }, [setEdges]);
  
    const handleShortestPath = async () => {
      const startNode = nodes[0]?.id;
      const endNode = nodes[nodes.length - 1]?.id;
  
      if (!startNode || !endNode) {
        alert('Creer au moins deux noeuds.');
        return;
      }

  const shortestPath = await findShortestPath(nodes, edges, startNode, endNode, setNodes, setEdges, setProcessingSteps);
  if (shortestPath.length === 0) {
    alert('Pas de.');
    return;
  }

  const pathEdges = [];
  for (let i = 0; i < shortestPath.length - 1; i++) {
    const source = shortestPath[i];
    const target = shortestPath[i + 1];
    const edge = edges.find((e) => (e.source === source && e.target === target) || (e.source === target && e.target === source));
    if (edge) {
      pathEdges.push(edge.id);
    }
  }

  const updatedNodes = nodes.map((node) => ({
    ...node,
    style: {
      ...node.style,
      backgroundColor: shortestPath.includes(node.id) ? 'deepskyblue' : 'white'
    }
  }));

  const updatedEdges = edges.map((edge) => ({
    ...edge,
    style: {
      stroke: pathEdges.includes(edge.id) ? 'deepskyblue' : 'black'
    }
  }));

  setNodes(updatedNodes);
  setEdges(updatedEdges);
};



const columns = [
  {
    title: 'Node',
    dataIndex: 'node',
    key: 'node',
  },
  {
    title: 'Distance',
    dataIndex: 'distance',
    key: 'distance',
  },
];

const [isShort,setIsShort] = useState(true);

const handleShortestPathClick = () => {
    setIsShort(true); // Met à jour isShort à true lorsque le bouton "chemin le plus court" est cliqué
  };

  const handleLongestPathClick = () => {
    setIsShort(false); // Met à jour isShort à false lorsque le bouton "chemin le plus long" est cliqué
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
          style={{ background: 'skyblue', border: 'none', padding: "10px" }}
        >
          C
        </button>
      </Controls>
    </ReactFlow>

    <div style={{marginTop:"10px"}}>
        <Button style={{ marginRight:"10px"}} onClick={handleShortestPathClick}>chemin le plus court</Button>
        <Button onClick={handleLongestPathClick}>chemin le plus long</Button>
    </div>

<div>{
    isShort ? (
        <div>
        <div style={{ margin: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
     <Button disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
     <StepBackwardOutlined />
      </Button>
      <Button type='primary' onClick={handleShortestPath}>
        Chemin minimal
      </Button>
      <Button disabled={currentStep === processingSteps.length - 1} onClick={() => setCurrentStep(currentStep + 1)}>
      <StepForwardOutlined />
      </Button>
      <Button style={{ marginLeft: "20px" }} onClick={resetGraphStyles}>
        Réinitialiser les traitements
      </Button>
    </div>
    <div style={{ margin: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <Table
      dataSource={processingSteps[currentStep]}
      columns={columns}
      pagination={false}
      rowKey="node"
      style={{ margin: "20px", width: "600px" }}
    />
    </div>
    </div>

    ) : (
        <div>
        <div style={{ margin: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Button disabled={currentStep === 0} onClick={() => setCurrentStep(currentStep - 1)}>
      <StepBackwardOutlined />      </Button>
      <Button type='default' onClick={handleShortestPath}>
        Chemin maximal
      </Button>
      <Button  disabled={currentStep === processingSteps.length - 1} onClick={() => setCurrentStep(currentStep + 1)}>
      <StepForwardOutlined />
      </Button>
      <Button style={{ marginLeft: "20px" }} onClick={resetGraphStyles} type="primary">
        Réinitialiser les traitements
      </Button>
    </div>
    <div style={{ margin: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <Table
      dataSource={processingSteps[currentStep]}
      columns={columns}
      pagination={false}
      rowKey="node"
      style={{ margin: "20px", width: "600px" }}
    />
    </div>
</div>
    )
    }</div>
    
    

    
  </div>
);
}

export default Flow;

  
  