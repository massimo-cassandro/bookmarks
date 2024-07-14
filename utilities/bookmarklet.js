// https://caiorss.github.io/bookmarklet-maker/


// TODO remove utm strings

const text = `* ${document.title} <${location}>`;
navigator.clipboard.writeText(text);
alert(text);


/*

javascript:(function()%7Bconst%20text%20%3D%20%60*%20%24%7Bdocument.title%7D%20%3C%24%7Blocation%7D%3E%60%3B%0Anavigator.clipboard.writeText(text)%3B%0Aalert(text)%3B%7D)()%3B

*/