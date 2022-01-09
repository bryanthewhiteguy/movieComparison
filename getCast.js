const axios = require("axios").default;
const request = require("request");
const cheerio = require("cheerio");

let movie1Title;
let movie2Title;
let savedMovie1;
let savedMovie2;
let movie1Group = "characters";
let movie2Group = "characters";

const emptyObject = { characters: [], crew: [] }

function getCast(movieName, movieNum, res) {

    const options = {
        method: 'GET',
        url: `https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/${movieName}`,
        headers: {
            'x-rapidapi-host': 'imdb-internet-movie-database-unofficial.p.rapidapi.com',
            'x-rapidapi-key': '09610e1e1cmsh0a76e35cb4e137cp1b58f1jsn6a38dfdfb964'
        }
    };

    axios.request(options).then(function (response) {
        // console.log(response.data);

        const data = response.data;
        const id = data.id;
        const URL = `https://www.imdb.com/title/${id}/fullcredits/`

        request(URL, (err, resp, body) => {
            if (err) {
                console.log(err);
            }
            else {

                const castMembers = parseBody(body);

                if (movieNum === 1) {

                    movie1Title = movieName;
                    getSimular(castMembers, savedMovie2 || emptyObject, res);
                    savedMovie1 = castMembers;
                }
                else {

                    movie2Title = movieName;
                    getSimular(savedMovie1 || emptyObject, castMembers, res );
                    savedMovie2 = castMembers;
                }

                return castMembers;
            }
        })


    }).catch(function (error) {
        console.error(error);

        return "An error occured while fetching data. (probably ur spelling tho lmao)"
    });
}

function parseBody(body, callback) {
    const $ = cheerio.load(body);

    let characters = [];
    let crew = [];
    let jobs = [];

    let namesArray = [];

    $("table.cast_list > tbody > tr").each(function (index) {

        const name = $(this).find("td:nth-child(2) > a").text().trim();
        const role = $(this).find("td.character > a:nth-child(1)").text().trim();

        if (!name == "") {

            if (namesArray.includes( name )) 
            {
                characters.forEach((c, index) => {
                    if (c.name == name) 
                    {
                        if (!c.role.includes( role )) {
                            c.role.push( role );
                        }
                    }
                })
            } else {
                const cast = {
                    name: name.trim(),
                    role: [ role.trim() ]
                }
    
                namesArray.push( name );
    
                characters.push(cast);
            }
        }
    })

    $("h4.dataHeaderWithBorder").each(function (index) {
        if ($(this).attr("name") !== "cast") {
            jobs.push($(this).attr("name"));
        }
    })

    $("table.simpleTable.simpleCreditsTable").each(function (index) {
        $(this).find("tbody > tr").each(function () {

            const name = $(this).find("td.name").text().trim();
            const role = jobs[index].trim();

            if (!$(this).find("td.name").text() == "") {
                
                if (namesArray.includes( name )) 
                {
                    characters.forEach((c, index) => {
                        if (c.name == name) 
                        {
                            if (!c.role.includes( role )) {
                                c.role.push( role );
                            }
                        }
                    })

                    crew.forEach((c, index) => {
                        if (c.name == name) 
                        {
                            if (!c.role.includes( role )) {
                                c.role.push( role );
                            }
                        }
                    })
                } else {
                    const cast = {
                        name: $(this).find("td.name").text().trim(),
                        role: [ jobs[index] ]
                    }
    
                    namesArray.push( name );
        
                    crew.push(cast);
                }
            }
        })
    })

    const castMembers = { characters: characters, crew: crew };

    return castMembers;
}

function createList(castArray, group) {
    
    castArray = castArray[group];

    const roleName = (group === "character" ? "Character" : "Role")

    const newCastArray = castArray.map(c => `Name: <a target="_blank" href="https://www.google.com/search?q=${c.name.split(" ").join("+")}">${c.name}<a> | ${roleName}: ${c.role.join(", ")}`);

    return newCastArray;
}

function createSimularList(array) {
    const newCastArray = array.map(c => `Name: <a target="_blank" href="https://www.google.com/search?q=${c.name.split(" ").join("+")}">${c.name}<a> | Roles: <br>${c.role1 === c.role2 ? `Both: ${c.role1}` : `${movie1Title}: ${c.role1}<br>${movie2Title}: ${c.role2}`}`);

    return newCastArray;
}

function arrayComparison(movie1Cast, movie2Cast) {

    const fullMovie1Cast = [...movie1Cast["characters"], ...movie1Cast["crew"]]
    const fullMovie2Cast = [...movie2Cast["characters"], ...movie2Cast["crew"]]

    let simularActors = [];

    fullMovie1Cast.forEach(a1 => {
        fullMovie2Cast.forEach(a2 => {

            const person1 = a1.name;
            const person2 = a2.name;
            const role1 = a1.role;
            const role2 = a2.role;

            if (person1 === person2) simularActors.push({ name: person1, role1: role1.join(", "), role2: role2.join(", ") });

        })
    })

    return simularActors;
}

function changeToggle( newMovie1Group, newMovie2Group, res ) {

    if (newMovie1Group !== null) {
        movie1Group = newMovie1Group;
    }
    if (newMovie2Group !== null) {
        movie2Group = newMovie2Group;
    }

    getSimular( savedMovie1 || emptyObject, savedMovie2 || emptyObject, res );
}

function getSimular( movie1Cast, movie2Cast, res ) {

    if (movie1Cast === undefined || movie2Cast === undefined) return;

    let simularCast = arrayComparison(movie1Cast, movie2Cast);

    let castList1 = createList(movie1Cast, movie1Group);
    let castList2 = createList(movie2Cast, movie2Group);
    let simularCastList = createSimularList(simularCast);

    res.render("index", { movie1: castList1, movie2: castList2, simular: simularCastList });
}

module.exports = { getCast, changeToggle };