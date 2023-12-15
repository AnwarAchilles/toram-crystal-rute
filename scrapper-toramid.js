let textResult = ``;

$(".container .col-md-8 .card").each((i, card)=> {
  i+=471;
  let name = $(card).find(".card-body .h6>.text-primary").text();
  let view = $(card).find(".card-body .tab-content dl").text();
  
  if (typeof name!=='undefined') {
    let textMap = "_map({\n\tcode:"+i+", \n\tlink:null, \n\ttype:\"ADDITIONAL\", \n\tname: \""+name+"\",\n\tview: `"+view+"`,\n}),\n";
    textResult += textMap;
  }
});

console.log(textResult);