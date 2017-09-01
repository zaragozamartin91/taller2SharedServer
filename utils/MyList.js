function MyList() {
    this.items = [];
}

MyList.prototype.add = function(item) {
    this.items.push(item);
};

MyList.prototype.items = function() {
    return this.items;
};

module.exports = MyList;
