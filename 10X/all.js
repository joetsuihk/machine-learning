Gene = function(code) {
	if (code) {
		this.code = code;
	}
	this.cost = 9999;
}

Gene.prototype.code = '';


//generate a random gene
Gene.prototype.random = function(length) {
	while (length--) {
		this.code += String.fromCharCode(Math.floor(Math.random()*128));
	}
};

//calculate the different between teo gene
Gene.prototype.calculateCost = function(compareTo) {
	var total = 0;
	for(i = 0; i < this.code.length; i++) {
        total += (this.code.charCodeAt(i) - compareTo.charCodeAt(i)) * (this.code.charCodeAt(i) - compareTo.charCodeAt(i));
	}
	this.cost = total;
};

//mix two gene and return two new one
Gene.prototype.mate = function(gene) {
    var pivot = Math.round(this.code.length / 2) - 1;

    var child1 = this.code.substr(0, pivot) + gene.code.substr(pivot);
    var child2 = gene.code.substr(0, pivot) + this.code.substr(pivot);

    return [new Gene(child1), new Gene(child2)];
};

//mutate 1 char at a time
Gene.prototype.mutate = function(chance) {
    if (Math.random() > chance)
            return;

    var index = Math.floor(Math.random()*this.code.length);
    var upOrDown = Math.random()<= 0.5 ? -1 : 1;
    var newChar = String.fromCharCode(this.code.charCodeAt(index) + upOrDown);
    var newString = '';
    for (i = 0; i < this.code.length; i++) {
        if (i == index) 
        	newString += newChar;
        else 
        	newString += this.code[i];
    }

    this.code = newString;
}


var Population = function(goal, memberSize) {
    this.members = [];
    this.costHistory = [];
    this.goal = goal;
    this.generationNumber = 0;
    while (memberSize--) {
        var gene = new Gene();
        gene.random(this.goal.length);
        this.members.push(gene);
    }
};

Population.prototype.sort = function() {
    this.members.sort(function(a, b) {
        return a.cost - b.cost;
    });
}

Population.prototype.display = function() {
	$('#member-population').html('Population: '+this.memberSize);
	$('#goal').html('Goal: '+this.goal);
	
	$('body').append('<div>Generation: '+this.generationNumber);
	for (var i = 0; i < this.members.length/2; i++) {
		$('body').append(' Gene: '+this.members[i].code+' ('+this.members[i].cost+')');
	}
	$('body').append('...</div>');
};

Population.prototype.costGraph = function() {
	scale = 1024/this.costHistory[0];
	for (var i = 0; i < this.costHistory.length; i++) {
		$('#cost-graph').append('<div style="width:'+this.costHistory[i]*scale+'px;height:3px;background-color:#f00;border-bottom:solid 1px #000;"></div>');
	}
};

Population.prototype.generation = function() {
    for (var i = 0; i < this.members.length; i++) {
        this.members[i].calculateCost(this.goal);    
    }

    this.sort();
    this.display();
    var children = this.members[0].mate(this.members[1]);

    //splice (startIndex, length, new items...)
    this.members.splice(this.members.length - 2, 2, children[0], children[1]);

    this.costHistory.push(this.members[0].cost);

    for (var i = 0; i < this.members.length; i++) {
        this.members[i].mutate(0.5);
        this.members[i].calculateCost(this.goal);
        if (this.members[i].code == this.goal) { 
            this.sort();
            this.display();
            this.costGraph();
            return true;
        }
    }
    this.generationNumber++;
    var scope = this;
    setTimeout(function() { scope.generation(); } , 20);
};

var population  = new Population("Hello", 20);
population.generation();