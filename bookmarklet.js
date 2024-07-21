// https://caiorss.github.io/bookmarklet-maker/

// eliminazione query string utm
let url = new URL(location),
  searchParams = url.searchParams;

// necessario fare la cancellazione delle chiavi in due passaggi
const keysToDelete = [];
for (const key of searchParams.keys()) {
  if (/^utm_/.test(key)) {
    keysToDelete.push(key);
  }
}
keysToDelete.forEach(k => searchParams.delete(k));
url.search = searchParams.toString();

const text = `* ${document.title} <${url.toString()}>`;
navigator.clipboard.writeText(text);
alert(text);


/*

javascript:(function()%7Blet%20url%20%3D%20new%20URL(location)%2C%0A%20%20searchParams%20%3D%20url.searchParams%3B%0A%0A%2F%2F%20necessario%20fare%20la%20cancellazione%20delle%20chiavi%20in%20due%20passaggi%0Aconst%20keysToDelete%20%3D%20%5B%5D%3B%0Afor%20(const%20key%20of%20searchParams.keys())%20%7B%0A%20%20if%20(%2F%5Eutm_%2F.test(key))%20%7B%0A%20%20%20%20keysToDelete.push(key)%3B%0A%20%20%7D%0A%7D%0AkeysToDelete.forEach(k%20%3D%3E%20searchParams.delete(k))%3B%0Aurl.search%20%3D%20searchParams.toString()%3B%0A%0Aconst%20text%20%3D%20%60*%20%24%7Bdocument.title%7D%20%3C%24%7Burl.toString()%7D%3E%60%3B%0Anavigator.clipboard.writeText(text)%3B%0Aalert(text)%3B%7D)()%3B

*/
