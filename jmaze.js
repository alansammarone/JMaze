JMaze = function(graph, cellSize, cellCount) {

	this.graph = graph
	this.cellSize = cellSize // [w, h] = [cellWidth, cellHeight]
	this.cellCount = cellCount // [i, j] = i rows, j colums


	this.wallWidth = 1
	this.wallColor = [0, 0, 0, 255] // RGBA colors
	this.cellColor = [255, 255, 255, 255]


	this.totalMazeWidth = this.cellSize[0] * this.cellCount[1]
	this.totalMazeHeight = this.cellSize[1] * this.cellCount[0]
	this.totalMazePixels = this.totalMazeWidth * this.totalMazeHeight

	this.animationMazePixelData = null


	this.animatedMazeFrontier = []




	// Returns a list of colors of length cellSize[0] * cellsize[1] represeting the cell positioned at the (i+1)th row (j+1)th column.
	this.getCellPixelData = function(i, j) {

		pixelData = []

		cellIndex = i*self.cellCount[1] + j

		hasLeftWall = j == 0 || !self.graph.areNodesNeighbors(cellIndex, cellIndex - 1)

		hasRightWall = j == (self.cellCount[1] - 1) || !self.graph.areNodesNeighbors(cellIndex, cellIndex + 1)

		hasTopWall = i == 0 || !self.graph.areNodesNeighbors(cellIndex, cellIndex - self.cellCount[1])

		hasBottomWall = i == (self.cellCount[0] - 1) || !self.graph.areNodesNeighbors(cellIndex, cellIndex + self.cellCount[1])


		color = [Math.random()*255, Math.random()*255, Math.random()*255, 255]

		for (var y=0; y<self.cellSize[1]; ++y)
			for (var x=0; x<self.cellSize[0]; ++x) {

				if (hasLeftWall && (x < self.wallWidth)) {
					pixelData.push(self.wallColor);
					continue;
				}

				if (hasRightWall && x >= (self.cellSize[0] - self.wallWidth)) {
					pixelData.push(self.wallColor);
					continue;
				}

				if (hasTopWall && (y < self.wallWidth)) {
					pixelData.push(self.wallColor);
					continue;
				}
				if (hasBottomWall && y >= (self.cellSize[1] - self.wallWidth)) {
					pixelData.push(self.wallColor);
					continue;
				}




				pixelData.push(self.cellColor);


			}


		return pixelData


	}



	this.computeNodesPosition = function() {

		self.nodesPosition = {}
		allNodes = Object.keys(self.graph.nodes);
		allNodesCount = allNodes.length;
		i = 0;
		j = 0;
		for (var n=0; n < allNodesCount; ++n) {
			self.nodesPosition[allNodes[n]] = [i, j]
			if (j == self.cellCount[1]-1) {
				j = 0;
				i++;

			} else {

				j++;
			}
		}


	}

	// Returns a list of colors of length (cellSize[0] * cellsize[1]) * (this.cellCount[0] * cellCount[1]), one for each pixel in the maze.
	this.getMazePixelData = function() {

		cellColoringFunction = self.getCellPixelData

		_mazePixelData = []
		mazePixelData = []
		cellsPixelData = []

		// First, get each cell's pixel data.
		for (var i=0;i<self.cellCount[0]; ++i) {
			cellsPixelData.push([])
			for (var j=0; j<self.cellCount[1]; ++j) cellsPixelData[i].push(cellColoringFunction(i, j))
		}
		// Now, build the final maze pixel data using the cell's data.
		pixelLinesCount = self.cellCount[0] * self.cellSize[1]

		for (var y=0; y<pixelLinesCount; ++y) { //Building (y+1)th line

			startSpliceAtRow = y % self.cellSize[1] // This is the correspoding row in each cell, whose pixelData needs to be copied to the mazePixelData
			startSpliceAtIndex = startSpliceAtRow * self.cellSize[0]
			endSpliceAtIndex = startSpliceAtIndex + cellSize[0]
			correspodingCellRow = (y - startSpliceAtRow)/cellSize[1] // Little trick to optimize the process. We need the (correspodingCellRow+1)ths cellDatas

			for (var j=0; j<self.cellCount[1]; ++j)  //Building the (y+1)th line of the cell present in the (j+1)th column.
				mazePixelData.push.apply(mazePixelData, cellsPixelData[correspodingCellRow][j].slice(startSpliceAtIndex, endSpliceAtIndex)) // Copy the ((y % cellSize[1]) + 1)th line of the cellPixelData to the (y + 1)th line of the mazePixelData.

		}
		// Now, lets just flatten the array
		for (var p=0; p<mazePixelData.length; ++p) _mazePixelData.push.apply(_mazePixelData, mazePixelData[p])
		return _mazePixelData

	}

	// Draws the maze using the built-in cell coloring function
	this.drawMazeToCanvas = function(canvas, sx, sy) {

		canvas.width = canvas.width // Clears the canvas
		context = canvas.getContext("2d");
		canvasPixelData = context.createImageData(self.cellSize[0]*self.cellCount[1], self.cellSize[1]*self.cellCount[0])

		mazePixelData = self.getMazePixelData()
		mazePixelDataLength = mazePixelData.length
		for (var q=0; q<mazePixelDataLength; ++q)
			canvasPixelData.data[q] = mazePixelData[q]

		context.putImageData(canvasPixelData, sx, sy)

	}


	this.animatedDrawMazeToCanvas = function(container) {

		if (self.animationMazePixelData == null)
		{
			context = container.getContext("2d")
			self.animationMazePixelData = context.createImageData(self.cellSize[0]*self.cellCount[1], self.cellSize[1]*self.cellCount[0])

			//self.initialNode = Object.keys(self.graph.nodes)[5]
			self.animatedVisitedNodes = [self.initialNode]


			this.animatedMazeFrontier = [self.initialNode] // Start with random node
			initialNodePosition = self.getNodePosition(self.initialNode)

			self.drawCellPixelDataToImageData(self.getSolidColor(self.getRandomColor()), initialNodePosition[0], initialNodePosition[1])


			startTime = Date.now()

			distanceInGraph = 0;
			missingNodes = Object.keys(self.graph.nodes)

			saturation = .5
			lightness = .6

			minimumFrontierSize = 1


		} else {

			hue = .5 + Math.sin(distanceInGraph/80)/5
			rgbColor = hslToRgb(hue, saturation, lightness)
			rgbColor.push(255)
			newFrontier = []
			animatedMazeFrontierLength = self.animatedMazeFrontier.length


			//console.log(animatedMazeFrontierLength)

			if (animatedMazeFrontierLength < minimumFrontierSize) {
				randomNotVisitedNode = parseInt(missingNodes[~~(Math.random()*missingNodes.length)])
				self.animatedMazeFrontier.push(randomNotVisitedNode + 1)
				self.animatedMazeFrontier.push(randomNotVisitedNode - 1)
				self.animatedMazeFrontier.push(randomNotVisitedNode + self.totalMazeWidth)
				self.animatedMazeFrontier.push(randomNotVisitedNode - self.totalMazeWidth)

			} else {


				for (var i=0; i<animatedMazeFrontierLength; ++i) {


					thisNeighbors = self.graph.getNeighbors(self.animatedMazeFrontier[i])
					neighborsLength = thisNeighbors.length
					for (var n=0; n<neighborsLength; ++n) {

						indexOfThisNode = missingNodes.indexOf(thisNeighbors[n])

						if (indexOfThisNode != -1) {
							missingNodes.splice(indexOfThisNode, 1)
							newFrontier.push(thisNeighbors[n])
							nodePosition = self.getNodePosition(thisNeighbors[n])
							self.drawCellPixelDataToImageData(self.getSolidColor(rgbColor), nodePosition[0], nodePosition[1])
						}

					}


				}

				self.animatedMazeFrontier = newFrontier


			}




			distanceInGraph++;





		}


		if (missingNodes.length == 0 && typeof(endTime) == 'undefined') {endTime = Date.now(); console.log((endTime-startTime)/1000)}

		context.putImageData(self.animationMazePixelData, 0, 0)

		requestAnimationFrame(function(){

			self.animatedDrawMazeToCanvas(container)
		})

	}


	this.getNodePosition = function(node) {
		return self.nodesPosition[node]
		return [~~(parseInt(node)/self.cellCount[1]), parseInt(node) % self.cellCount[1]]
	}



	this.getNodeAtPosition = function(i, j) {

		return i*self.cellCount[1] + j

	}


	this.getRandomColor = function () {

		return [Math.random()*255, Math.random()*255, Math.random()*255, 255]
	}

	this.drawCellPixelDataToImageData = function(cellPixelData, i, j) {



		for (var l=0; l<self.cellSize[1]; ++l) { //Loop through cellPixelData pixel lines
			linePixelData = cellPixelData.slice(l*self.cellSize[0] << 2, ((l + 1)*cellSize[0])<<2)
			mazePixelDataStart = (self.cellSize[0] << 2) * (self.cellCount[1] * (l + i*self.cellSize[1]) + j)
			self.animationMazePixelData.data.set(linePixelData, mazePixelDataStart)

		}
	}





	this.getSolidColor = function(color){



		pixelData = []
		for (var i=0; i<self.cellSize[0]*self.cellSize[1]*4; ++i)
			pixelData.push(color[i % 4])

		return pixelData
	}

	var self = this;
}