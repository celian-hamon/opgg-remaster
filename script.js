function main() {


    const champInfoIds = ["first-champ", "second-champ", "third-champ"];
    // {
    //     "id": "qiLkFBeg0NQlvt1gxMo8nk1-bf88fxhoHgqQcJ5JYm0QxEvd",
    //     "accountId": "mkij3sZ3jiY-7S4bK3iBn5rNICOTqQpHVV7OOrqlP4Z0NzA",
    //     "puuid": "5mdPyMvgiw8hZFT1p0eqoNF8r3f5WEIw01DzhXH1dtz2uK5iztqlK97VN8iDa2QZ1bSvC1guBSRjnw",
    //     "name": "cece3007",
    //     "profileIconId": 1388,
    //     "revisionDate": 1645984165000,
    //     "summonerLevel": 43
    // }
    // GET - https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/cece3007?api_key=RGAPI-e30cf4ee-89f1-418e-949f-1f33f3ba2878



    // salut tu vas bien je taime

    xhr = new XMLHttpRequest();
    xhr.open("GET", "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + user + "?api_key=RGAPI-e30cf4ee-89f1-418e-949f-1f33f3ba2878", true);
    xhr.onload = function () {
        if (this.status == 200) {
            let response = JSON.parse(this.responseText);
            document.getElementById("name").innerHTML = response.name;
            document.getElementById("level").innerHTML = response.summonerLevel;
            summoner.id = response.id;
            summoner.accountId = response.accountId;
            summoner.puuid = response.puuid;
            summoner.name = response.name;
            summoner.profileIconId = response.profileIconId;
            summoner.revisionDate = response.revisionDate;
            summoner.summonerLevel = response.summonerLevel;
            //load the profile picture
            pp = document.getElementById("profilePic");
            url = "http://ddragon.leagueoflegends.com/cdn/12.5.1/img/profileicon/" + summoner.profileIconId + ".png"
            pp.src = url;
        }
        loadChamps(summoner);
        loadMatchHistory(summoner);
    }
    xhr.send();

    function loadChamps(summoner) {
        xhr = new XMLHttpRequest();
        xhr.open("GET", "https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + summoner.id + "?api_key=RGAPI-e30cf4ee-89f1-418e-949f-1f33f3ba2878", true);
        xhr.onload = async function () {
            if (this.status == 200) {
                let response = JSON.parse(this.responseText);
                response.sort(function (a, b) {
                    return b.championLevel - a.championLevel;
                });
                for (let i = 0; i < 3; i++) {
                    let champ = response[i];
                    let champName = correctName(await getChampionName(champ.championId));
                    let champInfo = document.getElementById(champInfoIds[i]);
                    if (i == 0) {
                        //load the background
                        bg = document.getElementById("background");
                        bg.src = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champName + "_0.jpg";
                    }
                    if (champName.includes("'")) {
                        //delete the ` and replace the next letter with a capital letter
                        champName = champName.replace("'", "");
                        champName = champName.toLocaleLowerCase();
                        champName = champName.charAt(0).toUpperCase() + champName.slice(1);
                    }
                    champInfo.innerHTML = `

                        <img src="https://ddragon.leagueoflegends.com/cdn/12.5.1/img/champion/${champName}.png" width="100">

                        <h2>${champName}</h2>
                        <h3>${champ.championLevel} levels</h3>
                        <h3>${champ.championPoints} champs pts</h3>`;
                }
            }
        }
        xhr.send();
    }

    async function getChampionName(id) {
        let namechamp = "";

        let response = await fetch("http://ddragon.leagueoflegends.com/cdn/12.5.1/data/en_US/champion.json")
        let responseData = await response.json();
        responseData = responseData.data;
        for (var key in responseData) {
            if (responseData.hasOwnProperty(key)) {
                if (responseData[key].key == id) {
                    namechamp = responseData[key].name;
                    return namechamp;
                }
            }
        }
    }
    async function loadMatchHistory(summoner) {
        let response = await fetch("https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + summoner.puuid + "/ids?start=0&count=10&api_key=RGAPI-e30cf4ee-89f1-418e-949f-1f33f3ba2878")
        let responseData = await response.json();
        for (let i = 0; i < responseData.length; i++) {
            let matchId = responseData[i];
            let match = await getMatch(matchId);
            listChamps = [];

            let divMatch = document.getElementById("matchs");
            let duration = Math.trunc(match.info.gameDuration / 60);
            for (let c = 0; c < match.info.participants.length; c++) {
                listChamps.push(match.info.participants[c].championId);
            }
            //loop on the participants to find the summoner
            for (let i = 0; i < match.info.participants.length; i++) {
                if (match.info.participants[i].summonerId == summoner.id) {
                    summonerChamp = match.info.participants[i];
                }
            }
            let bg = "#ff0000";
            if (summonerChamp.win) {
                bg = "#0000ff";
            }

            divMatchHTML = `
        <div class="match row" style="background:${bg};">
            <div class="col-lg match-info">
                <h2>${match.info.gameMode}</h2>
                <h3>${duration} min</h3>
                <h3>${match.info.gameType}</h3>
            </div>
            <div class="col match-champ">`
            for (let c = 0; c < listChamps.length; c++) {
                let champNameRaw = await getChampionName(listChamps[c])
                let champName = correctName(champNameRaw);
                divMatchHTML += `
                <img src="https://ddragon.leagueoflegends.com/cdn/12.5.1/img/champion/${champName}.png" width="40">`
            }
            divMatchHTML += `   
            </div>                    
            
        </div>`;
            divMatch.innerHTML += divMatchHTML;

        }
    }
    async function getMatch(matchId) {
        let response = await fetch("https://europe.api.riotgames.com/lol/match/v5/matches/" + matchId + "?api_key=RGAPI-e30cf4ee-89f1-418e-949f-1f33f3ba2878")
        let responseData = await response.json();
        return responseData;
    }
    function correctName(name) {
        //if the name contain any other character than a-z or A-Z delete it and lower every letters and raise the first one
        let incorect = ["'", ".", " "];
        for (let i = 0; i < incorect.length; i++) {
            if (name.includes(incorect[i])) {
                name = name.replace(incorect[i], "");
                name = name.toLowerCase();
                name = name.charAt(0).toUpperCase() + name.slice(1);
            }
            if (name.includes("Wukong")) {
                name = "MonkeyKing";
                return name;
            }
            if (name.includes("Nunu")) {
                name = "Nunu";
                return name;
            }
            if (name.includes("LeBlanc")) {
                name = "Leblanc";
                return name;
            }
            if (name.includes("Dr")) {
                name = "DrMundo";
                return name;
            }
            if (name.includes("Master")) {
                name = "MasterYi";
                return name;
            }
            if (name.includes("Lee")) {
                name = "LeeSin";
                return name;
            }
            if (name.includes("Kog")) {
                name = "KogMaw";
                return name;
            }
            if (name.includes("Jarvan")) {
                name = "JarvanIV";
                return name;
            }
            if (name.includes("Xin")) {
                name = "XinZhao";
                return name;
            }
            if (name.includes("Miss")) {
                name = "MissFortune";
                return name;
            }

        }
        return name;
    }
}