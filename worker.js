importScripts('./lib/lunr.js/lunr.min.js');

var buildIndex = function(index, feed) {
  if (feed != '' || feed.length < 0) {
    for (var i = 0, l = feed.length; i < l; i++) {
      index.add(feed[i], false);
    }
  }
  return index;
}

self.addEventListener('message', function(evt){
  var data = JSON.parse(evt.data.feed);

  var idx = lunr(function(){
      var _self = this;
   // this.ref('url');
   // this.field('title', { boost: 50 });
   // this.field('content');
   // this.field('categories.name', { boost: 80 });
   // this.field('tags.name', { boost: 100});
   /*
    Maybe make a field array and a ref array, then loop through each one and call the field.name and field.boost

    searchParams.fields.map(function(name){
        this.field(name.name, { boost: name.boost })
    });

    this.ref(searchParams.ref);
   */
   evt.data.searchParams.fields.map(function(field){
       _self.field(field.name, { boost: field.boost });
   });

   _self.ref(evt.data.searchParams.ref);
  });

  if (data) {
    var index = buildIndex(idx,data);
  }

  self.postMessage(JSON.stringify(index.toJSON()));

  self.close();
}, false)
