function MyList() {
    this.items = [];
}

MyList.prototype.add = function(item) {
    this.items.push(item);
};

module.exports = MyList;
