listLinks = ['https://en.wikipedia.org/wiki/Brazil'];


function Parsing(text){
    list = [];
    words = text.split('@');
    console.log(words);
    words.forEach(word => {
        if (word.toLowerCase == 'brasil'){
            list.push('https://en.wikipedia.org/wiki/' + word);
        }
    })
    return list;
}


module.exports = {
    Parsing : Parsing
}

