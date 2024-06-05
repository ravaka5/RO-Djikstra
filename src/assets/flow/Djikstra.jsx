function Djikstra(){

class PriorityQueue {
    constructor() {
        this.nodes = [];
    }

    enqueue(priority, key) {
        this.nodes.push({key, priority});
        this.sort();
    }

    dequeue() {
        return this.nodes.shift();
    }

    sort() {
        this.nodes.sort((a, b) => a.priority - b.priority);
    }

    isEmpty() {
        return !this.nodes.length;
    }
}

function dijkstra(graph, start, end) {
    let distances = {};
    let prev = {};
    let pq = new PriorityQueue();

    distances[start] = 0;
    pq.enqueue(0, start);

    Object.keys(graph).forEach(node => {
        if (node !== start) {
            distances[node] = Infinity;
        }
        prev[node] = null;
    });

    while (!pq.isEmpty()) {
        let smallest = pq.dequeue().key;

        if (smallest === end) {
            let path = [];
            while (prev[smallest]) {
                path.push(smallest);
                smallest = prev[smallest];
            }
            return path.concat(start).reverse();
        }

        if (smallest || distances[smallest] !== Infinity) {
            for (let neighbor in graph[smallest]) {
                let alt = distances[smallest] + graph[smallest][neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    prev[neighbor] = smallest;
                    pq.enqueue(alt, neighbor);
                }
            }
        }
    }

    return distances;
}

// Example usage:
let graph ={
    'A': {'B': 1, 'E': 4},
    'B': {'A': 1, 'C': 2, 'D': 5},
    'C': {'A': 4, 'B': 2},
    'D': {'B': 5 , 'E':4},
    'E': {'D': 4 , 'C': 3},
};

let shortestPath = dijkstra(graph, 'A', 'E');
console.log(shortestPath); // Output: ['A', 'B', 'C', 'D']
return(
    <>
    <p>{shortestPath}</p>
    </>
)


}

export default Djikstra;