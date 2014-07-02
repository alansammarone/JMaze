JGraph = function(nodes) {

	this.isExplicitGraph = true

	this.nodes = {}
	this.positions = {}
	this.getImplicitNeighbors = null
	this.edges = []
	this.isDirectedGraph = false


	this.drawingRadius = 80


	this.getNeighbors = function(n) {
		if (self.isExplicitGraph) return this.nodes[n]
		else return this.getImplicitNeighbors(n)
	}


	this.populateEdges = function() {
		for (var n1 in self.nodes) {
			for (var n2 in self.nodes[n1])
				self.edges.push([n1, self.nodes[n1][n2]])
		}

	}


	this.removeEdge = function(node1, node2) {

		node1 += ""
		node2 += ""

		if (self.isDirectedGraph) {
			//Todo
		} else {
			node2Index = self.nodes[node1].indexOf(node2)
			node1Index = self.nodes[node2].indexOf(node1)

			~node2Index ? self.nodes[node1].splice(node2Index, 1) : ''
			~node1Index ? self.nodes[node2].splice(node1Index, 1) : ''

		}

	}


	this.randomWalkByLength = function(n, startingCell) {

		if (startingCell == undefined) {
			allCels = Object.keys(self.nodes)
			startingCell = allCels[~~(allCels.length * Math.random())]
		}

		walkLength = 0
		walkNodes = [startingCell]

		while (walkLength < n) {

			currentCell = walkNodes[walkNodes.length - 1];
			currentCellNeighbors = self.getNeighbors(currentCell)
			newCell = currentCellNeighbors[~~(currentCellNeighbors.length*Math.random())]
			walkNodes.push(newCell)
			walkLength++;
		}

		return walkNodes


	}


	this.areNodesNeighbors = function(node1, node2) {


		// Assuming undirected graphs
		node1 += ""
		node2 += ""

		return node1 != node2 && (self.nodes[node1].indexOf(node2) > -1 || self.nodes[node2].indexOf(node1) > -1)

	}

	//This implements breadth-first-search, returning the a list of nodes that correspond to a path from s to d.
	this.BFS = function(s, d) {
		var k = 0
		var parents = {}
		var levels = {}
		parents[s] = null
		levels[s] = 0

		var frontier = [s]
		while (frontier.length > 0 && k<100) {
			next = []
			for (var i=0; i<frontier.length; ++i) {
				neighbors = self.getNeighbors(frontier[i])
				for (var j=0; j<neighbors.length; ++j) {
					if (neighbors[j] == d) {
						parents[d] = frontier[i]
						return self.getPathFromParentList(parents, d)
					}
					if (!(neighbors[j] in levels)) {

						levels[neighbors[j]] = k
						parents[neighbors[j]] = frontier[i]
						next.push(neighbors[j])
					}
				}

			}
			frontier = next
			k++
		}
	}


	this.getSpanningTree = function(method) {



	}


	this.PrimsAlgorithm = function() {

		allNodes = Object.keys(self.nodes)
		initialNode = allNodes[~~(allNodes.length * Math.random())]
		newGraph = {}
		newGraph[initialNode] = []

		nodesToGo = allNodes.length - 1
		k = 0

		nodesAlreadyInTree = [initialNode]
		while(true) {

			nodesAlreadyInTreeNeighbors = []
			newNodeSource = nodesAlreadyInTree[~~(nodesAlreadyInTree.length * Math.random())]
			newNodeSourceNeighbors = self.getNeighbors(newNodeSource)
			newNode = newNodeSourceNeighbors[~~(newNodeSourceNeighbors.length * Math.random())]

			if (!(newNode in newGraph))
			{
				newGraph[newNodeSource].push(newNode)
				newGraph[newNode] = [newNodeSource]
				nodesAlreadyInTree.push(newNode)
				nodesToGo--
				if (nodesToGo == 0) break;
			}

			k++

		}



		return newGraph
	}

	this._PrimsAlgorithm = function() {

		allNodes = Object.keys(self.nodes)
		initialNode = allNodes[~~(allNodes.length * Math.random())]
		newGraph = {}
		newGraph[initialNode] = []

		nodesToGo = allNodes.length - 1
		k = 0

		while(true) {

			nodesAlreadyInTree = Object.keys(newGraph)
			nodesAlreadyInTreeNeighbors = []
			newNodeSource = nodesAlreadyInTree[~~(nodesAlreadyInTree.length * Math.random())]
			newNodeSourceNeighbors = self.getNeighbors(newNodeSource)
			newNode = newNodeSourceNeighbors[~~(newNodeSourceNeighbors.length * Math.random())]

			if (!(newNode in newGraph))
			{
				newGraph[newNodeSource].push(newNode)
				newGraph[newNode] = [newNodeSource]
				nodesToGo--
				if (nodesToGo == 0) break;
			}

			k++

		}
		console.log(nodesToGo)


		return newGraph
	}


	//This traverses a list of parents (parents[x] = y means y is parent of x) to find a path to d
	this.getPathFromParentList = function(parents, d) {

		path = [d]
		while (true)
		{

			p = parents[path[path.length-1]]
			if (p != null)
				path.push(parents[path[path.length-1]])
			else
				break

		}

		return path
	}

	this.drawGraphToContainer = function(container, positions) {

		if (positions && typeof(positions) == "object") self.drawGraphUsingPositions(container, positions)
		else if (!positions) self.drawGraphSmartly(container)
		else console.log("drawGraphToContainer: the positions value must be an object or null.")

	}

	// Here, we implet a force-based layout, using Hooke's law (springs) to model atraction, and Coulomb law (electricity) to model repulsion.
	this.drawGraphSmartly = function(container) {



		cWidth = container.width;
		cHeight = container.height;

		self.cWidth = cWidth;
		self.cHeight = cHeight;


		self.positions = {}

		nodeKeys = Object.keys(self.nodes);
		numberOfNodes = nodeKeys.length

		for (var i=0; i<numberOfNodes; ++i) {
			thisPosition = {x: ~~(self.drawingRadius/2  + (cWidth - self.drawingRadius) * Math.random()), y: ~~(self.drawingRadius/2 + (cHeight - self.drawingRadius) * Math.random())}
			thisPosition.y *= -1
			self.positions[nodeKeys[i]] = thisPosition

		}



		self.animatedGraphDrawing(container)




	}




	this.animatedGraphDrawing = function (container, positions) {

		numberOfIterations = 1 << 10

		//for (var i=0; i<numberOfIterations; ++i) {

		drawingInterval = window.setInterval(function(){

			if (!numberOfIterations--) { clearInterval(drawingInterval) }

			for (var p in self.nodes) {
				forceOnNode = self.calculateForceOnNode(p)

				if (self.positions[p].x <= 0) self.positions[p].x = 0
				//if (positions[p].y <= 0) positions[p].y = 0

				if (self.positions[p].x >= self.cWidth) self.positions[p].x = self.cWidth
				if (self.positions[p].y >= self.cHeight) self.positions[p].y = self.cHeight


				self.positions[p].x += .5 * forceOnNode.x
				self.positions[p].y += .5 * forceOnNode.y



			}

			self.drawGraphUsingPositions(container, self.positions)



		}, 5)


		//}


	}


	this.calculateForceOnNode = function(node) {

		c1 = 2
		c2 = 100
		c3 = 100000

		totalForce = {x: 0, y: 0}

			for (var j in self.nodes) {
				if (j == node) continue;

				displacementVector = {x: self.positions[j].x - self.positions[node].x, y: self.positions[j].y - self.positions[node].y }

				if (self.areNodesNeighbors(node, j)){

					totalForce.x += Number.sign(displacementVector.x) * c1 * Math.log(Math.abs(displacementVector.x)/c2)
					totalForce.y += Number.sign(displacementVector.y) * c1 * Math.log(Math.abs(displacementVector.y)/c2)

				} else {
					totalForce.x -= Number.sign(displacementVector.x) * c3 / Math.pow(displacementVector.x, 2)
					totalForce.y -= Number.sign(displacementVector.y) * c3 / Math.pow(displacementVector.y, 2)
				}

				if (self.positions[j].x <= 0 || self.positions[j].x >= self.cWidth) totalForce.x = 0
				if (self.positions[j].y <= 0 || self.positions[j].x >= self.cHeight) totalForce.y = 0

			}






		return totalForce

	}

	this.drawGraphUsingPositions = function(container, positions){

		radius = 30;
		color = "#d8762e"

		canvas = container.getContext("2d")

		positionsKeys = Object.keys(positions)
		if (positionsKeys.length != Object.keys(self.nodes).length) {
			console.log("drawGraphUsingPositions: positions must have a key for each node.");
			return;
		}

		// Clears canvas
		container.width = container.width

		// Nodes
		for (var i=0; i<positionsKeys.length;++i) {

			thisPosition = positions[positionsKeys[i]];
			canvas.beginPath()
			canvas.arc(thisPosition.x, -thisPosition.y, radius, 2*Math.PI, false)
			canvas.fillStyle = color
			canvas.fill()
			canvas.strokeStyle = "#ae5f25"
			canvas.lineWidth = 2
			canvas.stroke()
			canvas.closePath()
		}

		nodeKeys = Object.keys(self.nodes)

		//Edges
		for (var i=0; i<nodeKeys.length;++i) { // For each node
			fromPosition = positions[nodeKeys[i]]
			nodeNeighbors = self.getNeighbors(nodeKeys[i])


			for (var j=0; j<nodeNeighbors.length; ++j)	{ // For each neighbor
				toPosition = positions[nodeNeighbors[j]]

				canvas.beginPath();
				canvas.moveTo(fromPosition.x, -fromPosition.y)
				canvas.lineTo(toPosition.x, -toPosition.y)
				canvas.lineWidth = 2;
				canvas.strokeStyle = color;
				canvas.stroke()
				canvas.closePath()
			}

		}




	}








	// A path is an ordered list of nodes
	this.drawPath = function(container, nodes, positions) {

		if (!positions) positions = self.positions

		canvas = container.getContext("2d")

		for (var n=1; n<nodes.length; ++n) {
			canvas.beginPath()

			canvas.moveTo(positions[nodes[n-1]].x, -positions[nodes[n-1]].y)
			canvas.lineTo(positions[nodes[n]].x, -positions[nodes[n]].y)
			canvas.strokeStyle = "blue"
			canvas.lineWidth = 3
			canvas.stroke()
			canvas.closePath()


		}

	}


	if (typeof nodes == "object") {
		this.isExplicitGraph = true;
		this.nodes = nodes;


	}

	else if (typeof nodes == "function") {
		this.isExplicitGraph = false;
		this.getImplicitNeighbors = nodes
	}



	var self = this

	this.populateEdges(nodes)

}


Number.sign = function(x) { return x >= 0 ? 1 : -1 }

