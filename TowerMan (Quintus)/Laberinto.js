// Utils
// Generates a random number between min and max
function randomNumber(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}


// Build random mazes in Json format
// alorithm: Recursive Division 

var mazeJson= function(i,j){

	// Initialize maze in 0s
	var maze= [];
	for(var aux=0;aux<i;aux++){
		maze[aux]=[];
		for(var aux2=0;aux2<j;aux2++)
			maze[aux][aux2]=0;
	}
	
	// Set the outside walls	
	for(var aux=0;aux<j;aux++){
		maze[0][aux]=1;
		maze[i-1][aux]=1;
	}
	
	for(var aux=0;aux<i;aux++){
		maze[aux][0]=1;
		maze[aux][j-1]=1;
	}
	
	// Starts dividing
	mazeJson_2(maze,1,1,i-2,j-2);
	
	// Remove holes markers 
	for(var aux=0;aux<i;aux++){
		for(var aux2=0;aux2<j;aux2++)
			if(maze[aux][aux2]==2)
				maze[aux][aux2]=0;
	}
	
	// Set location for towers (comment if it isn't needed)
	maze[1][1]=2;
	maze[1][j-2]=2;
	maze[i-2][1]=2;
	maze[i-2][j-2]=2;
	
	// Return the matrix with the random maze
	return maze;
	
}

var mazeJson_2=function(maze,i,j,x,y){
	
	// Sector's height or width <=1
	if((i>=x)||(j>=y)){
		return;
	}
	
	// Selects a random column and a random row from the sector
	var hor = randomNumber(i+1,x-1);
	var ver = randomNumber(j+1,y-1);
	
	// Builds walls on te column and the row
	// The 2s in the matrix represents the entrance and exit of a hole in the wall
	for(var aux=j;aux<=y;aux++)
		if(maze[hor][aux]!= 2)
			maze[hor][aux]=1;
			
	for(var aux=i;aux<=x;aux++){
		if(maze[aux][ver]!= 2)
			maze[aux][ver]=1;
	}
	
	// The algorithm generates 4 walls we pick one randomly and open a hole randomly on the other 3 walls
	var pared= randomNumber(1,4);
	var r;
	if(pared==1){
	
		r=randomNumber(ver+1,y-1);////////2
		maze[hor][r]=0;
		if(hor-1!=0)
			maze[hor-1][r]=2;
		if(hor+1!=maze.length-1)
			maze[hor+1][r]=2;
		
		r=randomNumber(hor+1,x-1);///////3
		maze[r][ver]=0;
		if(ver-1!=0)
			maze[r][ver-1]=2;
		if(ver+1!=maze[0].length-1)
			maze[r][ver+1]=2;
			
		r=randomNumber(j+1,ver-1);//////4
		maze[hor][r]=0;
		if(hor-1!=0)
			maze[hor-1][r]=2;
		if(hor+1!=maze.length-1)
			maze[hor+1][r]=2;		
		
	}else{
		if(pared==2){
			r=randomNumber(i+1,hor-1); //////1
			maze[r][ver]=0;
			if(ver-1!=0)
				maze[r][ver-1]=2
			if(ver+1!=maze[0].length-1)
				maze[r][ver+1]=2			
			
			r=randomNumber(hor+1,x-1);///////3							//////////   Number of each wall
			maze[r][ver]=0;												//////////			1
			if(ver-1!=0)												//////////			|
				maze[r][ver-1]=2;										//////////	   4_ __|__ _2
			if(ver+1!=maze[0].length-1)									//////////			|
				maze[r][ver+1]=2;										//////////			|
																		//////////			3
			
			r=randomNumber(j+1,ver-1);//////4
			maze[hor][r]=0;
			if(hor-1!=0)
				maze[hor-1][r]=2;
			if(hor+1!=maze.length-1)
				maze[hor+1][r]=2;
				
		}else{
			if(pared==3){
				r=randomNumber(i+1,hor-1); //////1
				maze[r][ver]=0;
				if(ver-1!=0)
					maze[r][ver-1]=2
				if(ver+1!=maze[0].length-1)
					maze[r][ver+1]=2
				
				r=randomNumber(ver+1,y-1);////////2
				maze[hor][r]=0;
				if(hor-1!=0)
					maze[hor-1][r]=2;
				if(hor+1!=maze.length-1)
					maze[hor+1][r]=2;
				
				r=randomNumber(j+1,ver-1);//////4
				maze[hor][r]=0;
				if(hor-1!=0)
					maze[hor-1][r]=2;
				if(hor+1!=maze.length-1)
					maze[hor+1][r]=2;
				
				
			}else{
				r=randomNumber(i+1,hor-1); //////1
				maze[r][ver]=0;
				if(ver-1!=0)
					maze[r][ver-1]=2
				if(ver+1!=maze[0].length-1)
					maze[r][ver+1]=2				
				
				r=randomNumber(ver+1,y-1);////////2
				maze[hor][r]=0;
				if(hor-1!=0)
					maze[hor-1][r]=2;
				if(hor+1!=maze.length-1)
					maze[hor+1][r]=2;
				
				
				r=randomNumber(hor+1,x-1);///////3
				maze[r][ver]=0;
				if(ver-1!=0)
					maze[r][ver-1]=2;
				if(ver+1!=maze[0].length-1)
					maze[r][ver+1]=2;				
			}
		}
	}
	
	
	// Due to the intersection of the 2 walls 4 sub sections are generated so we apply the algorithm recursively
	mazeJson_2(maze,i,j,hor-1,ver-1);
	mazeJson_2(maze,i,ver+1,hor-1,y);
	mazeJson_2(maze,hor+1,j,x,ver-1);
	mazeJson_2(maze,hor+1,ver+1,x,y);
}










































