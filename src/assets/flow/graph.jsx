import ReactFlow, { addEdge, Controls, Background, useNodesState, useEdgesState,updateEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useState, useCallback,useRef} from 'react';

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // ['A', 'B', 'C', ..., 'Z']

const initialNodes = [];

const initialEdges = [];


function Flow() {

  const edgeUpdateSuccessful = useRef(true);

  const [nodes, setNodes , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges,onEdgesChange] = useEdgesState(initialEdges);
  const [alphabetIndex, setAlphabetIndex ] = useState(0); 

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const createNode = () => {
    if (alphabetIndex < alphabet.length) {
      const newLabel = alphabet[alphabetIndex];
      const newNode = {
        id: (nodes.length + 1).toString(),
        data: { label: newLabel , position:'right'},
        position: { x: -100, y: -100 },
        sourcePosition:"left",
        targetPosition:"right",
        style: { color: 'black', borderRadius: '200px', padding: '10px' , width:"35px"},
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


  
  return (
    <div style={{ height: '100%' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
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
    </div>
  );
}

export default Flow;
