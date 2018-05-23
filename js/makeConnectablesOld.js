var mob = false;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	mob = true;
}

function makeConnectables(func){	
	
	//how many elements were correctly dragged?
	var taskCompletion = 0;
	
	//get all drag button elements
	var dragButtons = document.getElementsByClassName("connectButton");
	
	//get all lines elements
	var lines = document.getElementsByClassName("lineSVG");
	
	//get all drop elements
	var dropDivs = document.getElementsByClassName("dropHandle");
	
	//get all hover parts 
	var hoverParts = document.getElementsByClassName("hoverParts");
	var dropToElement = -1;

	//make them transparent
	for(var k = 0; k < dropDivs.length; k++){
		dropDivs[k].style.opacity = "0";
	}
	
	//get all drag handle elements
	var dragDivs = Array.from(document.getElementsByClassName("dragHandle"));
	
	//save their initial positions and make them draggable
	var dragStates = {"pivot":{ left: "0px", top: "0px"}};
	
	for(var k = 0; k < dragDivs.length; k++){
		//assign the values to an object
		dragStates["pivot"].left = dragDivs[k].style.left;
		dragStates["pivot"].top = dragDivs[k].style.top;
		//assign it to the element, copying the object
		dragDivs[k].draghandlestates = JSON.parse(JSON.stringify(dragStates));
		//make it draggable
		drag(dragDivs[k]);
		
		//console.log(dragButtons[k].children[0].offsetLeft);
		
		//calculate & show the SVG lines at startup
		//var bezierRootX = dragButtons[k].children[0].offsetLeft + dragButtons[k].offsetWidth/2;
		//var bezierRootY = dragButtons[k].offsetTop;
		var bezierRootX = dragButtons[k].offsetLeft + dragButtons[k].children[0].offsetLeft + dragButtons[k].children[0].offsetWidth/2;
		var bezierRootY = dragButtons[k].offsetTop + dragButtons[k].children[0].offsetTop + dragButtons[k].children[0].offsetHeight/2;
		var posX = dragDivs[k].offsetLeft + dragDivs[k].offsetWidth/2;
		var posY = dragDivs[k].offsetTop + dragDivs[k].offsetHeight;
		
		var bezierHandleX = bezierRootX + (bezierRootX - posX)/2;
		var bezierHandleY = bezierRootY - (bezierRootY -posY)/2;
		
		lines[k].setAttribute("d","M"+bezierRootX+","+bezierRootY+" C"+bezierRootX+","+bezierHandleY+" "+posX+","+bezierHandleY+" "+posX+","+posY+"");
		lines[k].style.opacity = "1";
	}
	
	//highlight SVGs on hover
	anim();
	function anim(){
		requestAnimationFrame(anim);
		for(var i = 0; i < dropDivs.length; i++){
		
			if( dropDivs[i].className == "dropHandle dropHandleHover" ){
				hoverParts[i].style.fill = "rgba(255,248,174,0.6)";
			}
			else{
				hoverParts[i].style.fill = "rgba(0,0,0,0)";
			}
			if( dropDivs[i].act == "right" ){
				hoverParts[i].style.animationName = "rightSVG";
				hoverParts[i].style.animationDuration = "1s";
				hoverParts[i].style.fill = "rgba(0,0,0,0)";
			}
			if( dropDivs[i].anim == "1" ){
				hoverParts[i].style.animationName = null;
				hoverParts[i].focus();
				hoverParts[i].style.animationName = "wrongSVG";
				hoverParts[i].style.animationDuration = "1s";
				dropDivs[i].anim = 0;
			}

		}
	}
	
	
	//drag function
	function drag(elem) {
	
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		
		elem.onmousedown = dragMouseDown;
		if(mob){
			elem.ontouchstart = dragMouseDown;
		}

		var currentLine = -1;
		var interp = 0;
		var finalPosX = 0;
		var finalPosY = 0;
		var bezierRootX = 0;
		var bezierRootY = 0;
		var posX = 0;
		var posY = 0;
		
		var end = 0;

		function dragMouseDown(e) {
			e = e || window.event;
			//gets the mouse/finger position
			
			if(mob){
				pos3 = e.touches[0].clientX;
				pos4 = e.touches[0].clientY;
			}
			else{
				pos3 = e.clientX;
				pos4 = e.clientY;
			}
			
			//make the droppables visible
			for(var k = 0; k < dropDivs.length; k++){
				if(dropDivs[k].act != "right"){
					dropDivs[k].style.opacity = "1";
				}
			}
			
			elem.style.transition = "opacity 2s";
			//elem.style.transform = "scale(2,2)";
			elem.style.boxShadow = "0px 0px 0px 8px rgba(0,160,149,1)";
			
			if(elem.act != "right"){
				document.onmouseup = closeDragElement;
				if(mob){
					document.ontouchend = closeDragElement;
				}
				//if the mouse/finger moves
				document.onmousemove = elementDrag;
				if(mob){
					document.addEventListener("touchmove", elementDrag, { passive: false });
				}
			}
		}

		function elementDrag(e) {
			e = e || window.event;
			//new position of the draggable
			
			if(mob){
				e.preventDefault();
				pos1 = pos3 - e.touches[0].clientX;
				pos2 = pos4 - e.touches[0].clientY;
				pos3 = e.touches[0].clientX;
				pos4 = e.touches[0].clientY;
			}
			else{
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;
			}

			//handle next position
			elem.style.top = (elem.offsetTop - pos2) + "px";
			elem.style.left = (elem.offsetLeft - pos1) + "px";
			
			//currentLine
			currentLine = dragDivs.indexOf(elem);
			
			//set the SVG line new position
			var dragButton = dragButtons[dragDivs.indexOf(elem)];
			
			bezierRootX = dragButton.offsetLeft + dragButton.children[0].offsetLeft + dragButton.children[0].offsetWidth/2;
			bezierRootY = dragButton.offsetTop + dragButton.children[0].offsetTop + dragButton.children[0].offsetHeight/2;
			
			posX = (elem.offsetLeft - pos1) + elem.offsetWidth/2;
			posY = (elem.offsetTop - pos2) + elem.offsetHeight/2;
			
			var bezierHandleX = bezierRootX + (bezierRootX - posX)/2;
			var bezierHandleY = bezierRootY - (bezierRootY -posY)/2;
					
			lines[dragDivs.indexOf(elem)].setAttribute("d","M"+bezierRootX+","+bezierRootY+" C"+bezierRootX+","+bezierHandleY+" "+posX+","+bezierHandleY+" "+posX+","+posY+"");
			
			lines[dragDivs.indexOf(elem)].style.opacity = 1;
			
			//style button
			dragButton.classList.add("connectButtonSelected");
			
			//remove handle for a while to check what's underneath
			elem.style.visibility = "hidden";
			var under = document.elementFromPoint(pos3, pos4);
			elem.style.visibility = "visible";
			
			//console.log(under.parentNode);
			
			for(var i = 0; i < hoverParts.length; i++){
				
				if(under.id == hoverParts[i].id || under.parentNode.id == dropDivs[i].id){
					dropDivs[i].classList.add("dropHandleHover");
					dropToElement = i;
				}
				else{
					dropDivs[i].classList.remove("dropHandleHover");
				}
			}

			if(under.classList[0] == "svgContainer"){
				dropToElement = -1;
			}
			
		}
		
		animateLine();
		
		function animateLine(){
			requestAnimationFrame( animateLine );
			
			if(end == 1){//stays at upper part
				bezierRootX = dragButtons[currentLine].offsetLeft + dragButtons[currentLine].children[0].offsetLeft + dragButtons[currentLine].children[0].offsetWidth/2;
				bezierRootY = dragButtons[currentLine].offsetTop + dragButtons[currentLine].children[0].offsetTop + dragButtons[currentLine].children[0].offsetHeight/2;
				//bezierRootX = dragButtons[currentLine].offsetLeft + dragButtons[currentLine].offsetWidth/2;
				//bezierRootY = dragButtons[currentLine].offsetTop;
			}
			if(end == 2){//drops to bottom part
				bezierRootX = dragButtons[currentLine].offsetLeft + dragButtons[currentLine].children[0].offsetLeft + dragButtons[currentLine].children[0].offsetWidth/2;
				bezierRootY = dragButtons[currentLine].offsetTop + dragButtons[currentLine].offsetHeight + dragButtons[currentLine].children[0].offsetTop + dragButtons[currentLine].children[0].offsetHeight/2;
				//bezierRootX = dragButtons[currentLine].offsetLeft + dragButtons[currentLine].offsetWidth/2;
				//bezierRootY = dragButtons[currentLine].offsetTop + dragButtons[currentLine].offsetHeight;
			}
			
			//interpolate positions until finished
			if(interp >= 1 && currentLine >= 0){
				
				posX = (dragDivs[currentLine].offsetLeft - pos1) + dragDivs[currentLine].offsetWidth/2;
				posY = (dragDivs[currentLine].offsetTop - pos2) + dragDivs[currentLine].offsetHeight;

				posY = posY - 14;
				
				var bezierHandleX = bezierRootX + (bezierRootX - posX)/2;
				var bezierHandleY = bezierRootY - (bezierRootY -posY)/2;
						
				lines[dragDivs.indexOf(elem)].setAttribute("d","M"+bezierRootX+","+bezierRootY+" C"+bezierRootX+","+bezierHandleY+" "+posX+","+bezierHandleY+" "+posX+","+posY+"");
				
				if(interp < 600){
					interp++;
				}else{interp = 0; end = 0;}
			}	
			
		}
		

		function closeDragElement() {
			
			//animateLine
			interp = 1;
			
			//stop moving when released
			if(mob){
				document.ontouchend = null;
				document.ontouchmove = null;
				document.removeEventListener("touchmove", elementDrag);
			}
			else{
				document.onmouseup = null;
				document.onmousemove = null;
			}
		
			var isOut = 0;
			
			if(currentLine >= 0){
		
			//accept drops on click end
			for(var d = 0; d < dropDivs.length; d++){
				
				var topDrop = parseInt(elem.style.top,10);
				var lefDrop = parseInt(elem.style.left,10);
				var difUp = Math.abs(topDrop - parseInt(dropDivs[d].style.top,10));
				var difLeft = Math.abs(lefDrop - parseInt(dropDivs[d].style.left,10));

				if(dropToElement == d)
				{	
					if((dropToElement == d) && dropDivs[d].act != "right")
					{	
						//fit element, slowly, to the slot
						elem.style.left = dropDivs[d].style.left;
						elem.style.top = dropDivs[d].style.top;
						elem.style.transition = "left 0.5s, top 0.5s, opacity 2s";
						
						elem.style.transform = "scale(1.4,1.4)";
						//elem.style.boxShadow = "0px 0px 0px 8px solid black";

						elem.style.left = dropDivs[d].offsetLeft + (elem.offsetWidth*0.2) + "px";
						elem.style.top = dropDivs[d].offsetTop + (elem.offsetHeight*0.2) + "px";
						//check correctness of the drop:
						if( elem.dataset.conn == dropDivs[d].dataset.conn ){//right!
							
							elem.act = "right";
							dropDivs[d].act = "right";
							elem.style.pointerEvents = "none";
							elem.style.animationName = "rightDrop";
							elem.style.animationFillMode = "forwards";
							elem.style.animationDuration = "1s";
							
							//button animation
							//refresh Animations
							dragButtons[currentLine].style.animationName = null;
							dragButtons[currentLine].offsetHeight;
							
							dragButtons[currentLine].style.animationName = "rightDrop";
							dragButtons[currentLine].style.animationDuration = "2s";
							dragButtons[currentLine].style.animationFillMode = "forwards";
							
							dragButtons[currentLine].style.backgroundColor = "#ffffff";
							
							setTimeout(function(){
								
								dragButtons[currentLine].style.left = dragButtons[currentLine].dataset.fposx + "px"; 
								dragButtons[currentLine].style.top = dragButtons[currentLine].dataset.fposy + "px";
								dragButtons[currentLine].style.boxShadow = "0";
								dragButtons[currentLine].children[0].style.opacity = "0";
								elem.style.opacity = "0";
								lines[currentLine].style.stroke = "#fff";
								interp = 2;

								if(dragButtons[currentLine].dataset.fposy > elem.offsetTop){
									end = 1;
								}
								else{ end = 2; }
							},1000);
							
							taskCompletion += 1;
							
							if(taskCompletion == (dragDivs.length)){ finishTask(); }
						}
						else{//wrong!
							dropDivs[d].anim = "1";
							//refresh Animations
							elem.style.animationName = null;
							elem.offsetHeight; 
							//animate Wrong
							elem.style.animationName = "wrongDropHandle";
							elem.style.animationDuration = "1s";
							
							//button animation
							//refresh Animations
							dragButtons[currentLine].style.animationName = null;
							dragButtons[currentLine].offsetHeight;
							
							dragButtons[currentLine].style.animationName = "wrongDrop";
							dragButtons[currentLine].style.animationDuration = "1s";
							
							//button pin animation
							//refresh Animations
							dragButtons[currentLine].children[0].style.animationName = null;
							dragButtons[currentLine].children[0].offsetHeight;
							
							dragButtons[currentLine].children[0].style.animationName = "wrongPin";
							dragButtons[currentLine].children[0].style.animationDuration = "1s";
							
							//line Animation
							//refresh Animations
							lines[currentLine].style.animationName = null;
							lines[currentLine].focus();
							
							lines[currentLine].style.animationName = "wrongLine";
							lines[currentLine].style.animationDuration = "1s";
							
							
							//return element to original position
							setTimeout(function(){
								elem.style.transform = "scale(1,1)";
								returnElement();
							},800);
						}
						
					}
					else{
						isOut += 1;	
					}
				}
				else{
					isOut += 1;
				}
			}
			dragButtons[currentLine].classList.remove("connectButtonSelected");
			elem.style.boxShadow = "0px 3px 8px 2px rgba(0,0,0,0.2)";
			
			//make them invisible
			for(var k = 0; k < dropDivs.length; k++){
				dropDivs[k].style.opacity = "0";
			}

			if(isOut == dropDivs.length){
				elem.style.transform = "scale(1,1)";
				returnElement();
			}
			isOut = 0;
			}
		}
		
		function returnElement(){
			//return it to its initial positions
			elem.style.transition = "left 0.5s, top 0.5s, opacity 1s";
			Object.assign(elem.style, elem.draghandlestates["pivot"]);
			//clean hovers
			for(var i = 0; i < dropDivs.length; i++){
				//dropDivs[i].style.backgroundColor = "#f0f0f0";
				dropDivs[i].classList.remove("dropHandleHover");
			}
		}
		function finishTask()
		{	
			//end task after 1 second
			setTimeout(function(){
				func();
			},1000);
		}
	
	}
}