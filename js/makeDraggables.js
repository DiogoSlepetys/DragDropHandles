if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	mob = true;
}
else{
	var mob = false;
}

function makeDraggables(func){	
	
	//how many elements were correctly dragged?
	var taskCompletion = 0;
	
	//get all drag elements
	var dragDivs = document.getElementsByClassName("dragDiv");
	//save their initial positions and make them draggable
	var dragStates = {"pivot":{ left: "0px", top: "0px"}};
	
	for(var k = 0; k < dragDivs.length; k++){
		//assign the values to an object
		dragStates["pivot"].left = dragDivs[k].style.left;
		dragStates["pivot"].top = dragDivs[k].style.top;
		//assign it to the element, copying the object
		dragDivs[k].states = JSON.parse(JSON.stringify(dragStates));
		//make it draggable
		drag(dragDivs[k]);
	}
	
	//drag function
	function drag(elem) {
	
		//get all drop elements
		var dropDivs = document.getElementsByClassName("dropDiv");
	
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		
		elem.onmousedown = dragMouseDown;
		if(mob){
			elem.ontouchstart = dragMouseDown;
		}
		

		function dragMouseDown(e) {
			e = e || window.event;
			
			//get the cursor/finger position
			if(mob){
				pos3 = e.touches[0].clientX;
				pos4 = e.touches[0].clientY;
			}
			else{
				pos3 = e.clientX;
				pos4 = e.clientY;
			}
			
			elem.style.transition = "opacity 2s";
			
			if(elem.act != "right"){
				document.onmouseup = closeDragElement;
				if(mob){
					document.ontouchend = closeDragElement;
				}
			
				document.onmousemove = elementDrag;
				if(mob){
					document.addEventListener("touchmove", elementDrag, { passive: false });
				}
			}
		}

		function elementDrag(e) {
			e = e || window.event;
			//new cursor/finger position:

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
			
			//set the draggable new position
			elem.style.top = (elem.offsetTop - pos2) + "px";
			elem.style.left = (elem.offsetLeft - pos1) + "px";
			
			//highlight drops on hover
			for(var d = 0; d < dropDivs.length; d++){
				
				if(((elem.offsetTop + 40) > dropDivs[d].offsetTop) && ((elem.offsetTop - 40) < dropDivs[d].offsetTop))
				{	
					if(((elem.offsetLeft + 60) > dropDivs[d].offsetLeft) && ((elem.offsetLeft - 60) < dropDivs[d].offsetLeft)){
						dropDivs[d].style.backgroundColor = "#bbb";
					}
					else{ 
						dropDivs[d].style.backgroundColor = "#f0f0f0";
					}
				}
				else{ 
					dropDivs[d].style.backgroundColor = "#f0f0f0";
				}
			
			}
			
		}

		function closeDragElement() {
			
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
		
			//accept drops on click end
			for(var d = 0; d < dropDivs.length; d++){
				
				var topDrop = parseInt(elem.style.top,10);
				var lefDrop = parseInt(elem.style.left,10);
				var difUp = Math.abs(topDrop - parseInt(dropDivs[d].style.top,10));
				var difLeft = Math.abs(lefDrop - parseInt(dropDivs[d].style.left,10));
				
				//console.log(d + ":");

				if(difUp < 40)
				{	
					if(difLeft < 60 && dropDivs[d].act != "right")
					{	
						//console.log("inside " + d);
						//fit element, slowly, to the slot
						elem.style.left = dropDivs[d].style.left;
						elem.style.top = dropDivs[d].style.top;
						elem.style.transition = "left 0.5s, top 0.5s, opacity 2s";
						
						//check correctness of the drop:
						if( elem.dataset.conn == dropDivs[d].dataset.conn ){//right!
							
							elem.act = "right";
							dropDivs[d].act = "right";
							elem.style.pointerEvents = "none";
							elem.style.animationName = "rightDropStay";
							elem.style.animationFillMode = "forwards";
							elem.style.animationDuration = "1s";
							
							elem.style.zIndex = "0";
							taskCompletion += 1;
							if(taskCompletion == (dropDivs.length)){ finishTask(); }
						}
						else{//wrong!
							//refresh Animations
							elem.style.animationName = null;
							elem.offsetHeight; 
							//animate Wrong
							elem.style.animationName = "wrongDrop";
							elem.style.animationDuration = "0.8s";
							//return element to original position
							setTimeout(function(){
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
			if(isOut == dropDivs.length){
				returnElement();
			}
			isOut = 0;
			
		}
		function returnElement(){
			//return it to its initial positions
			elem.style.transition = "left 0.8s, top 0.8s, opacity 1s";
			Object.assign(elem.style, elem.states["pivot"]);
			//clean hovers
			for(var i = 0; i < dropDivs.length; i++){
				dropDivs[i].style.backgroundColor = "#f0f0f0";
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





