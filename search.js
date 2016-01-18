var lunr_search = function(options){
  var search = {};

  //default options
  search.url = options.url || '';
  search.resultsTemplate = options.resultsTemplate || '';
  search.noResultsTemplate = options.noResultsTemplate || '';
  search.domElement = options.domElement || '';
  search.searchParams = options.searchParams || '';


  //properties that will be set
  search.index;
  search.feed;
  search.ready = false;

  search.getFeed = function(url) {
    if (typeof url == 'undefined') {
      url = search.url
    }
    var xhr = new XMLHttpRequest;

    xhr.open('get', url);
    xhr.addEventListener('load', function(e){
      search.feed = JSON.parse(e.target.response);
      
      var worker = new Worker('worker.js');

      worker.addEventListener('message', function(evt){
        var indexedData = evt.data;
        search.index = lunr.Index.load(JSON.parse(indexedData));
        search.ready = true;
        console.log('Lunr index from worker is ready!');

        worker.terminate();
      }, false);
      var workerData = {
          searchParams: search.searchParams,
          feed: JSON.stringify(search.feed)
      }
        worker.postMessage(workerData);
    });
    xhr.send();
  }

  search.find = function(query, cb) {
    var results = search.index.search(query);
    var limit = limit || results.length;
    var output = {
      amount: results.length,
      entries: []
    };

    if (results.length > 0) {
      results.map(function(result) {
        search.feed.map(function(entry){
          if (entry.url === result.ref ) {
            output.entries.push({
              query: query,
              url: entry.url,
              title: entry.title,
              categories: entry.categories,
              tags: entry.tags,
              date: entry.date,
              author: entry.author,
              excerpt: entry.excerpt
            });
          }
        });
      });
    } else {
      output.entries.push({
        message: 'We\'re sorry, we couldn\'t find anything'
      });
    }

    cb(output);
  }

  //render expects the results as an object and a dom element to render it to
  search.render = function(results, template, element) {
      var html = Mustache.render(template, { entries: results.entries, length: results.amount });
      element.html(html);
  }

  return search;
};
